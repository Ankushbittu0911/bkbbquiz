const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,       // STARTTLS — required on Render.com (port 465 is blocked)
    requireTLS: true,    // enforce TLS upgrade
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // tolerate self-signed certs in some environments
    },
  });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BKBBQUIZ <noreply@bkbbquiz.com>',
    to: email,
    subject: 'Password Reset Request - BKBBQUIZ',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">🏆 BKBBQUIZ</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Password Reset</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 16px;">Hi ${name},</h2>
            <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
              We received a request to reset your password. Click the button below to create a new password. This link expires in 30 minutes.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fbbf24);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;">
                Reset Password
              </a>
            </div>
            <p style="color:#64748b;font-size:13px;margin:24px 0 0;">
              If you didn't request this, please ignore this email. Your password won't change.<br><br>
              <strong style="color:#94a3b8;">Link:</strong> <a href="${resetUrl}" style="color:#f97316;">${resetUrl}</a>
            </p>
          </div>
          <div style="background:#0a0e1a;padding:16px;text-align:center;">
            <p style="color:#475569;font-size:12px;margin:0;">© 2024 BKBBQUIZ. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

    const info = await transporter.sendMail(mailOptions);

    console.log('Mail sent:', info.response);
    return true;
  } catch (error) {
    console.error('Mail error:', error);
    throw error;
  }
};

const sendWinnerEmail = async (email, name, contestTitle, prize, ticketNumber) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🎉 Congratulations! You won ₹${prize} in ${contestTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111827;color:#f1f5f9;padding:32px;border-radius:16px;">
        <h1 style="color:#fbbf24;">🏆 You're a Winner!</h1>
        <p>Hi ${name}, you have won <strong style="color:#f97316;">₹${prize}</strong> in <strong>${contestTitle}</strong>.</p>
        <p>Ticket Number: <strong style="color:#06b6d4;">${ticketNumber}</strong></p>
        <p>Your winnings have been credited to your wallet.</p>
        <p>Play more contests and keep winning! 🎮</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendWinnerEmail };
