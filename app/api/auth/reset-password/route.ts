import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters' 
      }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired OTP' 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name);

    console.log(`✅ Password reset successfully for ${user.email}`);

    return NextResponse.json({ 
      message: 'Password reset successfully. You can now sign in with your new password.' 
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}