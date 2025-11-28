import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    console.log("--- VERIFY OTP DEBUG START ---");
    console.log("1. Input Email:", email);
    console.log("2. Input OTP:", otp);

    if (!email || !otp) {
      return NextResponse.json({ 
        error: 'Email and OTP are required' 
      }, { status: 400 });
    }

    await dbConnect();

    // CRITICAL FIX: Select the hashed fields and don't filter by them in query
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+resetOTP +resetOTPExpiry');

    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json({ 
        error: 'Invalid or expired OTP' 
      }, { status: 400 });
    }

    console.log("3. ✅ User Found - ID:", user._id);
    console.log("4. DB Stored Hash:", user.resetOTP ? "Present" : "Missing");
    console.log("5. OTP Expiry:", user.resetOTPExpiry);

    // Check if OTP exists
    if (!user.resetOTP) {
      console.log("❌ No OTP found on user");
      return NextResponse.json({ 
        error: 'No password reset requested. Please request a new OTP.' 
      }, { status: 400 });
    }

    // Check if OTP has expired
    if (!user.resetOTPExpiry || user.resetOTPExpiry < new Date()) {
      console.log("❌ OTP has expired");
      return NextResponse.json({ 
        error: 'OTP has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // CRITICAL FIX: Compare using bcrypt since OTP is hashed
    const isOTPValid = await bcrypt.compare(otp, user.resetOTP);
    console.log("6. OTP Verification Result:", isOTPValid ? "✅ Valid" : "❌ Invalid");

    if (!isOTPValid) {
      console.log("❌ OTP comparison failed");
      return NextResponse.json({ 
        error: 'Invalid OTP code. Please check and try again.' 
      }, { status: 400 });
    }

    console.log(`✅ OTP verified successfully for ${user.email}`);
    console.log("--- VERIFY OTP DEBUG END ---");

    return NextResponse.json({ 
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}