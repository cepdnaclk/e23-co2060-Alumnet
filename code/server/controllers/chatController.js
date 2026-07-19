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

        CASE
          WHEN c.student_user_id = $1
          THEN alumni.last_seen
          ELSE student.last_seen
        END AS other_user_last_seen,

        CASE
          WHEN c.student_user_id = $1
          THEN (alumni.last_seen IS NOT NULL AND alumni.last_seen > (NOW() - INTERVAL '2 minutes'))
          ELSE (student.last_seen IS NOT NULL AND student.last_seen > (NOW() - INTERVAL '2 minutes'))
        END AS is_online,

        (
          SELECT COALESCE(
            CASE
              WHEN m.deleted_at IS NOT NULL THEN 'Message deleted'
              ELSE m.message_text
            END,
            CASE
              WHEN m.deleted_at IS NOT NULL THEN 'Message deleted'
              WHEN m.message_type = 'voice' THEN 'Voice message'
              WHEN m.message_type = 'file' THEN COALESCE(m.attachment_name, 'File attachment')
              ELSE NULL
            END
          )
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

        ,(
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id <> $1
            AND COALESCE(m.is_read, false) = false
        )::int AS unread_count

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
          u.avatar_url AS other_user_avatar,
          u.last_seen AS other_user_last_seen,
          (u.last_seen IS NOT NULL AND u.last_seen > (NOW() - INTERVAL '2 minutes')) AS is_online
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
          u.avatar_url AS other_user_avatar,
          u.last_seen AS other_user_last_seen,
          (u.last_seen IS NOT NULL AND u.last_seen > (NOW() - INTERVAL '2 minutes')) AS is_online
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
          message_type,
          attachment_name,
          deleted_at,
          created_at
        FROM messages
        WHERE conversation_id=$1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [conversationId]
      );

      const unreadCount = await pool.query(
        `
        SELECT COUNT(*)::int AS unread_count
        FROM messages
        WHERE conversation_id=$1
          AND sender_id <> $2
          AND COALESCE(is_read, false) = false
        `,
        [conversationId, userId]
      );

      result.push({
        id: conversationId,
        other_user_id: contact.other_user_id,
        other_user_name: contact.other_user_name,
        other_user_avatar: contact.other_user_avatar,
        other_user_last_seen: contact.other_user_last_seen,
        is_online: Boolean(contact.is_online),
        last_message:
          formatLastMessagePreview(lastMessage.rows[0]) || null,
        last_message_at:
          lastMessage.rows[0]?.created_at || null,
        unread_count: unreadCount.rows[0]?.unread_count || 0,
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

    await pool.query(
      `
      UPDATE messages
      SET is_read = true,
          read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE conversation_id = $1
        AND sender_id <> $2
        AND COALESCE(is_read, false) = false
      `,
      [conversationId, userId]
    );

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
    const {
      message_text,
      message_type = "text",
      attachment_url,
      attachment_name,
      attachment_mime_type,
      attachment_size,
    } = req.body;

    const cleanText = typeof message_text === "string" ? message_text.trim() : null;
    const isAttachment = message_type === "file" || message_type === "voice";

    if (!["text", "file", "voice"].includes(message_type)) {
      return res.status(400).json({
        message: "Invalid message type",
      });
    }

    if (!cleanText && !isAttachment) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (isAttachment && !attachment_url) {
      return res.status(400).json({
        message: "Attachment URL is required",
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
        message_text,
        message_type,
        attachment_url,
        attachment_name,
        attachment_mime_type,
        attachment_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        conversationId,
        userId,
        cleanText,
        message_type,
        attachment_url || null,
        attachment_name || null,
        attachment_mime_type || null,
        attachment_size || null,
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

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const messageResult = await pool.query(
      `
      SELECT m.*, c.student_user_id, c.alumni_user_id
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = $1
      `,
      [messageId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const message = messageResult.rows[0];
    const hasAccess =
      Number(message.student_user_id) === Number(userId) ||
      Number(message.alumni_user_id) === Number(userId);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (Number(message.sender_id) !== Number(userId)) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    const result = await pool.query(
      `
      UPDATE messages
      SET
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $2,
        message_text = NULL,
        attachment_url = NULL,
        attachment_name = NULL,
        attachment_mime_type = NULL,
        attachment_size = NULL
      WHERE id = $1
      RETURNING *
      `,
      [messageId, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Delete message error:", error);

    res.status(500).json({
      message: "Failed to delete message",
    });
  }
};

function formatLastMessagePreview(message) {
  if (!message) return null;
  if (message.deleted_at) return "Message deleted";
  if (message.message_text) return message.message_text;
  if (message.message_type === "voice") return "Voice message";
  if (message.message_type === "file") return message.attachment_name || "File attachment";
  return null;
}

module.exports = {
  getMyConversations,
  getChatContacts,
  getConversationMessages,
  sendMessage,
  deleteMessage,
};
