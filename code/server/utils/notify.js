const pool = require("../config/db");

// A reusable internal function to generate notifications
const createNotification = async (userId, title, message, type) => {
    try {
        await pool.query(
            `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            `,
            [userId, title, message, type]
        );
        console.log(`[Notification Created] Type: ${type} | User: ${userId}`);
    }   catch (error) {
        console.error("Failed to create notification:", error);
        // Note: We intentiallaly do not throw the error here.
        // If a notification fails to save, we don't want it to crash the main feature
    }
};

const createNotificationsForRoles = async (roles, title, message, type) => {
    try {
        await pool.query(
            `
            INSERT INTO notifications (user_id, title, message, type)
            SELECT id, $2, $3, $4
            FROM users
            WHERE role = ANY($1::varchar[])
              AND verification_status = 'verified'
            `,
            [roles, title, message, type]
        );
    } catch (error) {
        console.error("Failed to create role notifications:", error);
        // Notification delivery must not prevent the original action succeeding.
    }
};

module.exports = { createNotification, createNotificationsForRoles };
