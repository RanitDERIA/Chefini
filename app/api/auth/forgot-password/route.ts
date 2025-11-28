import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetOTP } from '@/lib/email';
import bcrypt from 'bcryptjs';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    console.log("--- FORGOT PASSWORD DEBUG START ---");
    console.log("1. Input Email:", email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Select password, resetOTP, and resetOTPExpiry fields
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password +resetOTP +resetOTPExpiry');

    // CRITICAL FIX: Check if user exists BEFORE doing anything
    if (!user) {
      console.log("❌ User not found in database");
      // Return generic message (security: don't reveal if email exists)
      // But include a flag for frontend to know not to proceed
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive an OTP code.',
        shouldProceed: false // Frontend should NOT redirect
      });
    }

    console.log("2. ✅ User Found - ID:", user._id);

    // Check if account uses password authentication
    if (!user.password) {
      console.log("❌ User exists but uses OAuth (Google sign-in)");
      return NextResponse.json({ 
        error: 'This account uses Google sign-in. Please sign in with Google.' 
      }, { status: 400 });
    }

    // Generate plain OTP (6 digits)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash the OTP before saving to database
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Save hashed OTP and expiry to database
    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    console.log(`3. 🔐 OTP Generated (plain): ${otp}`);
    console.log(`4. 🔒 OTP (hashed): ${hashedOTP.substring(0, 20)}...`);
    console.log(`5. ⏰ Expiry: ${otpExpiry}`);

    // ONLY send email if user exists and has password
    console.log(`6. 📧 Sending OTP email to ${user.email}...`);
    const emailResult = await sendPasswordResetOTP(user.email, otp, user.name);

    if (!emailResult.success) {
      console.error('❌ Failed to send OTP email:', emailResult.error);
      
      // Clear the OTP since email failed
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      await user.save();
      
      return NextResponse.json({ 
        error: 'Failed to send OTP email. Please try again.' 
      }, { status: 500 });
    }

    console.log(`✅ OTP sent successfully to ${user.email}`);
    console.log("--- FORGOT PASSWORD DEBUG END ---");

    return NextResponse.json({ 
      message: 'OTP has been sent to your email address.',
      email: user.email,
      shouldProceed: true // Frontend should redirect to OTP page
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}