import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('+password');

    if (!user || !user.password) {
      return NextResponse.json({ 
        error: 'Cannot change password for Google sign-in accounts' 
      }, { status: 400 });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name);

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}