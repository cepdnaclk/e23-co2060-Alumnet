const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, bcc, subject, html, text }) => {
  if (!to && !bcc) {
    throw new Error("An email recipient is required");
  }

  return transporter.sendMail({
    from: `"Alumnet" <${process.env.EMAIL_USER}>`,
    to,
    bcc,
    subject,
    html,
    text,
  });
};

module.exports = sendEmail;
