import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;
if (env.useSmtp) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

/** Sends real mail when SMTP_* env vars are set; otherwise logs to the console so
 * password-reset/notification flows are still fully testable without a mail provider. */
export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log('\n[mail:dev] SMTP not configured — printing email instead of sending it.');
    console.log(`[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n[mail:dev] Body:\n${text || html}\n`);
    return { dev: true };
  }
  return transporter.sendMail({ from: env.smtp.from, to, subject, html, text });
}
