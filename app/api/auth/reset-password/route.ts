import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    console.log("--- RESET PASSWORD DEBUG START ---");
    console.log("1. Input Email:", email);
    console.log("2. Input OTP:", otp);

    // Validate all required fields
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    await dbConnect();

    // Find user with all necessary fields
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password +resetOTP +resetOTPExpiry');

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
      // Clear expired OTP
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      await user.save();
      
      return NextResponse.json({ 
        error: 'OTP has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Verify OTP using bcrypt
    const isOTPValid = await bcrypt.compare(otp, user.resetOTP);
    console.log("6. OTP Verification Result:", isOTPValid ? "✅ Valid" : "❌ Invalid");

    if (!isOTPValid) {
      console.log("❌ OTP comparison failed");
      return NextResponse.json({ 
        error: 'Invalid OTP code. Please check and try again.' 
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user password and clear OTP fields
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    console.log("7. ✅ Password updated successfully");

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
      console.log("8. ✅ Confirmation email sent");
    } catch (emailError) {
      console.error("⚠️ Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    console.log("--- RESET PASSWORD DEBUG END ---");
    
    return NextResponse.json({ 
      message: 'Password reset successfully. You can now log in with your new password.' 
    });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}