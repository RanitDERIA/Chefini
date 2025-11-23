import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetOTP } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive an OTP code.' 
      });
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: 'This account uses Google sign-in. Please sign in with Google.' 
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send email with OTP
    const emailResult = await sendPasswordResetOTP(user.email, otp, user.name);

    if (!emailResult.success) {
      console.error('Failed to send OTP email');
      return NextResponse.json({ 
        error: 'Failed to send OTP email. Please try again.' 
      }, { status: 500 });
    }

    console.log(`✅ OTP sent to ${user.email}: ${otp} (expires in 10 min)`);

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive an OTP code.',
      email: user.email // Return email so we can prefill it on verify page
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}