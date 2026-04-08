const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    console.log('Sending password reset email via Resend to:', email);

    const { data, error } = await resend.emails.send({
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
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Mail sent via Resend, id:', data.id);
    return true;
  } catch (error) {
    console.error('Mail error:', error);
    throw error;
  }
};

const sendWinnerEmail = async (email, name, contestTitle, prize, ticketNumber) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'BKBBQUIZ <noreply@bkbbquiz.com>',
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

  if (error) {
    console.error('Resend winner email error:', error);
    throw new Error(error.message);
  }
};

module.exports = { sendPasswordResetEmail, sendWinnerEmail };
