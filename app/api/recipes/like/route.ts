import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    await dbConnect();

    // Find the user and recipe
    const user = await User.findById(session.user.id);
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
    
    // Fix: Explicitly type 'id' as any to prevent implicit any error
    const hasLiked = user.likedRecipes.some((id: any) => id.toString() === recipeId);

    if (hasLiked) {
      // Unlike: Remove from user's liked recipes and decrement recipe likes
      // Fix: Explicitly type 'id' as any here as well
      user.likedRecipes = user.likedRecipes.filter((id: any) => id.toString() !== recipeId);
      recipe.likes = Math.max(0, recipe.likes - 1); // Ensure likes don't go negative
      
      await user.save();
      await recipe.save();

      console.log(`👎 User ${user.email} unliked recipe: ${recipe.title}`);

      return NextResponse.json({
        liked: false,
        likes: recipe.likes,
        message: 'Recipe unliked'
      });
    } else {
      // Like: Add to user's liked recipes and increment recipe likes
      user.likedRecipes.push(recipeObjectId);
      recipe.likes = (recipe.likes || 0) + 1;
      
      await user.save();
      await recipe.save();

      console.log(`👍 User ${user.email} liked recipe: ${recipe.title}`);

      return NextResponse.json({
        liked: true,
        likes: recipe.likes,
        message: 'Recipe liked'
      });
    }
  } catch (error: any) {
    console.error('❌ Like/Unlike error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}