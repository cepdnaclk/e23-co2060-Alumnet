const pool = require("../config/db");
const sendEmail = require("./sendEmail");

function getClientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildEmail({
  recipientName,
  heading,
  message,
  buttonText,
  buttonPath,
  details = [],
}) {
  const safeName = escapeHtml(recipientName || "there");
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const buttonUrl = buttonPath ? `${getClientUrl()}${buttonPath}` : null;

  const detailsHtml =
    details.length > 0
      ? `
        <div style="margin:22px 0;padding:16px 18px;background:#f7f7f5;border-radius:12px;">
          ${details
            .filter((item) => item && item.label && item.value !== undefined && item.value !== null)
            .map(
              (item) => `
                <p style="margin:6px 0;color:#333333;">
                  <strong>${escapeHtml(item.label)}:</strong>
                  ${escapeHtml(item.value)}
                </p>
              `
            )
            .join("")}
        </div>
      `
      : "";

  const buttonHtml =
    buttonUrl && buttonText
      ? `
        <p style="margin:26px 0 8px;">
          <a
            href="${buttonUrl}"
            style="
              display:inline-block;
              padding:12px 22px;
              background:#111111;
              color:#ffffff;
              text-decoration:none;
              border-radius:999px;
              font-weight:600;
            "
          >
            ${escapeHtml(buttonText)}
          </a>
        </p>
      `
      : "";

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f3f2ef;font-family:Arial,sans-serif;color:#111111;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 30px 12px;">
                    <p style="margin:0 0 22px;font-size:22px;font-weight:700;">Alumnet</p>
                    <h2 style="margin:0 0 16px;font-size:24px;line-height:1.25;">
                      ${safeHeading}
                    </h2>
                    <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">
                      Hi ${safeName},
                    </p>
                    <p style="margin:0;font-size:16px;line-height:1.6;color:#444444;">
                      ${safeMessage}
                    </p>
                    ${detailsHtml}
                    ${buttonHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 30px 28px;color:#777777;font-size:13px;line-height:1.5;">
                    This is an automatic notification from Alumnet.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendUserNotificationEmail({
  userId,
  subject,
  heading,
  message,
  buttonText,
  buttonPath,
  details = [],
  category,
}) {
  try {
    const preferenceColumns = {
      mentorship: "email_mentorship_notifications",
      event: "email_event_notifications",
      account: "email_account_notifications",
    };
    const preferenceColumn = preferenceColumns[category];

    if (!preferenceColumn) {
      console.warn(`[Email skipped] Invalid email category: ${category}`);
      return false;
    }

    const result = await pool.query(
      `
      SELECT full_name, email
      FROM users
      WHERE id = $1
        AND ${preferenceColumn} = TRUE
      LIMIT 1
      `,
      [userId]
    );

    const user = result.rows[0];

    if (!user?.email) {
      console.warn(`[Email skipped] No email found for user ${userId}`);
      return false;
    }

    await sendEmail({
      to: user.email,
      subject,
      html: buildEmail({
        recipientName: user.full_name,
        heading,
        message,
        buttonText,
        buttonPath,
        details,
      }),
    });

    console.log(`[Email sent] ${subject} -> ${user.email}`);
    return true;
  } catch (error) {
    console.error(`[Email failed] ${subject} -> user ${userId}:`, error.message);
    return false;
  }
}

async function sendRoleNotificationEmail({
  roles,
  subject,
  heading,
  message,
  buttonText,
  buttonPath,
  details = [],
  category,
}) {
  try {
    const preferenceColumns = {
      mentorship: "email_mentorship_notifications",
      event: "email_event_notifications",
      account: "email_account_notifications",
    };
    const preferenceColumn = preferenceColumns[category];

    if (!preferenceColumn) {
      console.warn(`[Email skipped] Invalid email category: ${category}`);
      return false;
    }

    const result = await pool.query(
      `
      SELECT email
      FROM users
      WHERE role = ANY($1::varchar[])
        AND verification_status = 'verified'
        AND ${preferenceColumn} = TRUE
        AND email IS NOT NULL
      `,
      [roles]
    );

    const emails = [...new Set(result.rows.map((row) => row.email).filter(Boolean))];

    if (emails.length === 0) {
      console.warn(`[Email skipped] No recipients found for roles: ${roles.join(", ")}`);
      return false;
    }

    await sendEmail({
      to: process.env.EMAIL_USER,
      bcc: emails,
      subject,
      html: buildEmail({
        recipientName: "Alumnet member",
        heading,
        message,
        buttonText,
        buttonPath,
        details,
      }),
    });

    console.log(`[Bulk email sent] ${subject} -> ${emails.length} recipient(s)`);
    return true;
  } catch (error) {
    console.error(`[Bulk email failed] ${subject}:`, error.message);
    return false;
  }
}

module.exports = {
  sendUserNotificationEmail,
  sendRoleNotificationEmail,
};
