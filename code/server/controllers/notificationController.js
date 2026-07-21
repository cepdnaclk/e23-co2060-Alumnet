const pool = require("../config/db");

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id; 
        // Removed the LIMIT 20 to allow the dedicated page to fetch all history
        const result = await pool.query(
            `
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get notification error:", error);
        res.status(500).json({ message: "Failed to fetch notifications"});
    }
};

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
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Failed to update notifications"});
    }
};

const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        
        await pool.query(
            `
            DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            `,
            [notificationId, userId]
        );

        res.json({ message: "Notification deleted successfully"});
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ message: "Failed to delete notification"});
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE
            `,
            [userId]
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ message: "Failed to update notifications" });
    }
};


module.exports = { getMyNotifications, markAsRead, deleteNotification, markAllAsRead };

