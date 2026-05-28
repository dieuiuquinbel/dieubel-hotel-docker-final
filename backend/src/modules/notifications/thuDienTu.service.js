// Chức năng: Cấu hình và gửi email thông báo.
// Module email: cau hinh Nodemailer va ham gui thu dung chung.
const nodemailer = require('nodemailer');

function daCauHinhGuiMail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function taoBoGuiMail() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function guiMail({ to, subject, html, text, attachments = [] }) {
  if (!daCauHinhGuiMail()) {
    return {
      skipped: true,
      reason: 'SMTP is not configured',
    };
  }

  const transporter = taoBoGuiMail();
  const from = process.env.MAIL_FROM || `"StayNest" <${process.env.SMTP_USER}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = {
  daCauHinhGuiMail,
  guiMail,
};
