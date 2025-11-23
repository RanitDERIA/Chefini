import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    console.log('📧 Testing email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Enable debug logs
      logger: true, // Enable logger
    });

    console.log('🔍 Verifying transporter connection...');

    // Verify connection
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');

    // Send test email
    console.log('📨 Sending test email to:', to);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Chefini Test" <noreply@chefini.com>',
      to: to,
      subject: 'Test Email from Chefini',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #FFC72C; border: 4px solid #000;">
          <h1 style="color: #000;">🍳 CHEFINI TEST EMAIL</h1>
          <p style="color: #000; font-size: 18px;">
            If you're reading this, your email configuration is working perfectly!
          </p>
          <p style="color: #000;">
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: 'Test email from Chefini - If you receive this, email is working!',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error: any) {
    console.error('❌ Email test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.toString(),
    }, { status: 500 });
  }
} 