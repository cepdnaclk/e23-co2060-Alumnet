const pool = require("../config/db");

// Fetch the latest 20 notifications for the logged-in user
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT auth middleware

        const result = await pool.query(
            `
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
            `,
            [userId]
        );

        res.json(result.rows);
    }   catch (error) {
        console.error("Get notification error:", error);
        res.status(500).json({ message: "Failed to fetch notifications"});
    }
};

// Mark a specific notification as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        
        await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1 AND user_id = $2
            `,
            [notificationId, userId]
        );

        res.json({ message: "Notification marked as read"});
    }   catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Failed to update notifications"});
    }
};

module.exports = { getMyNotifications, markAsRead};