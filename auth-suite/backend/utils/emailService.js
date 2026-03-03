const nodemailer = require("nodemailer");

let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log("Email transporter not configured. Email payload:", { to, subject, html });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@vistaraiq.com",
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(email, token) {
  const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your VistaraIQ account",
    html: `<p>Welcome to VistaraIQ.</p><p>Verify your email by clicking <a href=\"${url}\">this link</a>.</p>`,
  });
}

async function sendResetPasswordEmail(email, token) {
  const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your VistaraIQ password",
    html: `<p>Reset your password by clicking <a href=\"${url}\">this link</a>. This link expires soon.</p>`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
