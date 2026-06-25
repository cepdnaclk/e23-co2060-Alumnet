const pool = reuqire("../config/db");

// A reusable internal function to generate notifications
const createNotifiction = async (useId, title, message, type) => {
    try {
        await pool.query(
            `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            `,
            [useId, title, message, type]
        );
        console.log('[Notification Created] Type: ${type} | User: ${userId}');
    }   catch (error) {
        console.error("Failed to create notification:", error);
        // Note: We intentiallaly do not throw the error here.
        // If a notification fails to save, we don't want it to crash the main feature
    }
};

module.exports = { createNotification};