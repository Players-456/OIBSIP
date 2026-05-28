/* ============================================
   SENDEMAIL.JS — Nodemailer Email Utility
   ============================================ */

const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP credentials from .env
 *
 * @param {object} options
 * @param {string} options.to      — recipient email address
 * @param {string} options.subject — email subject line
 * @param {string} options.html    — HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  // Create a transporter using SMTP settings from .env
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true only for port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'AuthSystem'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;