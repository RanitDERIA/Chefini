import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired OTP' 
      }, { status: 400 });
    }

    console.log(`✅ OTP verified for ${user.email}`);

    return NextResponse.json({ 
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}