import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

// GET - Fetch user's recipes or public recipes
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    console.log('📖 Fetching recipes, type:', type);

    await dbConnect();

    let recipes;
    if (type === 'public') {
      // Return FULL recipe details for public recipes
      recipes = await Recipe.find({ isPublic: true })
        .populate('createdBy', 'name image avatar')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(); // Use lean() for better performance
    } else if (session?.user) {
      recipes = await Recipe.find({ createdBy: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`✅ Found ${recipes.length} recipes`);
    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error('❌ GET recipes error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save recipe to user's cookbook
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipeData = await req.json();

    await dbConnect();
    
    // Create a copy of the recipe for the current user
    const newRecipe = await Recipe.create({
      ...recipeData,
      createdBy: session.user.id,
      isPublic: false, // Personal copy is private by default
      likes: 0, // Reset likes for personal copy
    });

    console.log('✅ Recipe saved to cookbook:', newRecipe._id);
    return NextResponse.json({ recipe: newRecipe }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST recipe error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update recipe
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId, updates } = await req.json();

    if (!recipeId) {
      console.error('❌ No recipeId provided');
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    console.log('📝 Updating recipe:', recipeId);

    await dbConnect();
    const recipe = await Recipe.findByIdAndUpdate(recipeId, updates, { new: true });

    if (!recipe) {
      console.error('❌ Recipe not found:', recipeId);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    console.log('✅ Recipe updated');
    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error('❌ PATCH recipe error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete recipe
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get('id');

    if (!recipeId) {
      console.error('❌ No recipeId provided');
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    console.log('🗑️ Deleting recipe:', recipeId);

    await dbConnect();
    const result = await Recipe.findOneAndDelete({ 
      _id: recipeId, 
      createdBy: session.user.id 
    });

    if (!result) {
      console.error('❌ Recipe not found or unauthorized');
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    console.log('✅ Recipe deleted');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ DELETE recipe error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}