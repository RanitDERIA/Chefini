import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return array of liked recipe IDs as strings
    const likedRecipeIds = user.likedRecipes.map(id => id.toString());

    return NextResponse.json({ likedRecipes: likedRecipeIds });
  } catch (error: any) {
    console.error('❌ Get liked recipes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}