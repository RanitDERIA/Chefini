import nodemailer from 'nodemailer';

// Helper to create transporter ensures Env Vars are loaded at runtime
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error('❌ Missing EMAIL_USER or EMAIL_PASSWORD in environment variables');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false // Helps with some local dev self-signed cert issues
    }
  });
};

export async function sendPasswordResetOTP(email: string, otp: string, userName: string) {
  try {
    console.log(`📧 Preparing to send OTP to: ${email}`);

    const transporter = createTransporter();

    // Check connection (optional, good for debugging)
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // SPAM FIX: The 'from' address must match the authenticated user 
    // or Google will flag it as spoofing.
    const sender = `"${process.env.EMAIL_FROM_NAME || 'Chefini'}" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Your Chefini Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`, // Fallback text
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; }
              .header { background: #FFC72C; padding: 30px; text-align: center; border: 4px solid #000; border-bottom: none; }
              .header h1 { margin: 0; color: #000; font-size: 36px; font-weight: 900; letter-spacing: -1px; }
              .content { padding: 40px 30px; border: 4px solid #000; border-top: none; }
              .otp-box { background: #FFC72C; border: 4px solid #000; padding: 30px; text-align: center; margin: 30px 0; }
              .otp-code { font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #000; font-family: 'Courier New', monospace; }
              .warning { background: #FFF3CD; border: 2px solid #000; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border: 4px solid #000; border-top: none; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>CHEFINI</h1>
              </div>
              <div class="content">
                <h2 style="margin-top: 0;">Password Reset OTP</h2>
                <p>Hi ${userName}!</p>
                <p>You requested to reset your password for your Chefini account. Use the OTP code below:</p>
                
                <div class="otp-box">
                  <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #000;">YOUR OTP CODE</p>
                  <div class="otp-code">${otp}</div>
                </div>

                <div class="warning">
                  <strong>⏰ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
                </div>

                <p><strong>Security Tips:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>Chefini will never ask for your OTP</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>

                <p style="margin-bottom: 0;"><strong>Happy Cooking!</strong></p>
              </div>
              <div class="footer">
                <div style="font-size:14px; font-weight:bold; color:#000; margin-bottom:8px;">&copy; ${new Date().toLocaleDateString('en-IN', { year: 'numeric' })} Chefini. All rights reserved</div>
            <div style="font-size:12px; color:#666;">Crafted with ❤️ by <strong>RanitDERIA</strong></div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Password reset OTP sent successfully');
    console.log('   Message ID:', info.messageId);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send OTP email');
    console.error('   Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordChangedEmail(email: string, name: string) {
  try {
    console.log(`📧 Sending password changed confirmation to: ${email}`);

    const transporter = createTransporter();

    // SPAM FIX: Match sender
    const sender = `"${process.env.EMAIL_FROM_NAME || 'Chefini'}" <${process.env.EMAIL_USER}>`;

    await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Your Chefini Password Was Changed',
      text: `Hi ${name}, your password was changed successfully on ${new Date().toLocaleString()}.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; }
              .header { background: #FFC72C; padding: 30px; text-align: center; border: 4px solid #000; border-bottom: none; }
              .header h1 { margin: 0; color: #000; font-size: 36px; font-weight: 900; }
              .content { padding: 40px 30px; border: 4px solid #000; border-top: none; }
              .alert { background: #FFE5E5; border: 3px solid #FF0000; padding: 20px; margin: 20px 0; }
              .success { background: #E5FFE5; border: 3px solid #00AA00; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border: 4px solid #000; border-top: none; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍳 CHEFINI</h1>
              </div>
              <div class="content">
                <h2 style="margin-top: 0;">Password Changed Successfully</h2>
                <p>Hi ${name}!</p>
                <div class="success">
                  <strong>✅ Confirmation:</strong> Your password was changed on ${new Date().toLocaleString()}.
                </div>
                <div class="alert">
                  <strong>⚠️ Security Alert:</strong> If you didn't make this change, contact support immediately.
                </div>
                <p style="margin-bottom: 0;"><strong>Happy Cooking!</strong><br>The Chefini Team</p>
              </div>
              <div class="footer">
                <p style="margin: 5px 0;">Developed by <strong>RanitDERIA</strong></p>
                <p style="margin: 5px 0;">Made with ❤️ by Chefini</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Password changed email sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}