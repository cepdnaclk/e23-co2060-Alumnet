const pool = require("../config/db");

const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.created_at,

        CASE
          WHEN c.student_user_id = $1
          THEN alumni.id
          ELSE student.id
        END AS other_user_id,

        CASE
          WHEN c.student_user_id = $1
          THEN alumni.full_name
          ELSE student.full_name
        END AS other_user_name,

        CASE
          WHEN c.student_user_id = $1
          THEN alumni.avatar_url
          ELSE student.avatar_url
        END AS other_user_avatar,

        (
          SELECT m.message_text
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT m.created_at
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_at

      FROM conversations c

      JOIN users student
        ON student.id = c.student_user_id

      JOIN users alumni
        ON alumni.id = c.alumni_user_id

      WHERE c.student_user_id = $1
         OR c.alumni_user_id = $1

      ORDER BY COALESCE(
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ),
        c.created_at
      ) DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      message: "Failed to fetch conversations",
    });
  }
};

const getChatContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let contacts;

    if (role === "student") {
      contacts = await pool.query(
        `
        SELECT
          u.id AS other_user_id,
          u.full_name AS other_user_name,
          u.avatar_url AS other_user_avatar
        FROM mentorship_requests mr
        JOIN users u
          ON u.id = mr.alumni_user_id
        WHERE mr.student_user_id = $1
          AND mr.status = 'accepted'
        ORDER BY u.full_name
        `,
        [userId]
      );
    } else if (role === "alumni") {
      contacts = await pool.query(
        `
        SELECT
          u.id AS other_user_id,
          u.full_name AS other_user_name,
          u.avatar_url AS other_user_avatar
        FROM mentorship_requests mr
        JOIN users u
          ON u.id = mr.student_user_id
        WHERE mr.alumni_user_id = $1
          AND mr.status = 'accepted'
        ORDER BY u.full_name
        `,
        [userId]
      );
    } else {
      return res.json([]);
    }

    const result = [];

    for (const contact of contacts.rows) {
      let conversation;

      if (role === "student") {
        conversation = await pool.query(
          `
          SELECT *
          FROM conversations
          WHERE student_user_id=$1
            AND alumni_user_id=$2
          `,
          [userId, contact.other_user_id]
        );
      } else {
        conversation = await pool.query(
          `
          SELECT *
          FROM conversations
          WHERE student_user_id=$1
            AND alumni_user_id=$2
          `,
          [contact.other_user_id, userId]
        );
      }

      let conversationId;

      if (conversation.rows.length === 0) {
        const newConversation = await pool.query(
          `
          INSERT INTO conversations
          (
              mentorship_request_id,
              student_user_id,
              alumni_user_id
          )
          SELECT
              mr.id,
              mr.student_user_id,
              mr.alumni_user_id
          FROM mentorship_requests mr
          WHERE mr.student_user_id = $1
            AND mr.alumni_user_id = $2
            AND mr.status = 'accepted'
          RETURNING id
          `,
          role === "student"
            ? [userId, contact.other_user_id]
            : [contact.other_user_id, userId]
        );

        console.log("newConversation.rows output:", newConversation.rows);
        conversationId = newConversation.rows[0]?.id || null;
      } else {
        conversationId = conversation.rows[0].id;
      }

      const lastMessage = await pool.query(
        `
        SELECT
          message_text,
          created_at
        FROM messages
        WHERE conversation_id=$1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [conversationId]
      );

      result.push({
        id: conversationId,
        other_user_id: contact.other_user_id,
        other_user_name: contact.other_user_name,
        other_user_avatar: contact.other_user_avatar,
        last_message:
          lastMessage.rows[0]?.message_text || null,
        last_message_at:
          lastMessage.rows[0]?.created_at || null,
      });
    }

    result.sort((a, b) => {
      const da = a.last_message_at
        ? new Date(a.last_message_at)
        : new Date(0);

      const db = b.last_message_at
        ? new Date(b.last_message_at)
        : new Date(0);

      return db - da;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch chat contacts",
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    // Verify access
    const conversationResult = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE id = $1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const conversation = conversationResult.rows[0];

    const hasAccess =
      Number(conversation.student_user_id) === Number(userId) ||
      Number(conversation.alumni_user_id) === Number(userId);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const messagesResult = await pool.query(
      `
      SELECT *
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [conversationId]
    );

    res.json(messagesResult.rows);

  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { message_text } = req.body;

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE id = $1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const conversation = conversationResult.rows[0];

    const hasAccess =
      Number(conversation.student_user_id) === Number(userId) ||
      Number(conversation.alumni_user_id) === Number(userId);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        message_text
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        conversationId,
        userId,
        message_text.trim()
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};

module.exports = {
  getMyConversations,
  getChatContacts,
  getConversationMessages,
  sendMessage,
};