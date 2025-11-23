import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { ingredients, dietary = [], healthyMode = false, staples = true } = body;

    // Validate ingredients
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      console.error('❌ No ingredients provided:', ingredients);
      return NextResponse.json({ 
        error: 'Please provide at least one ingredient' 
      }, { status: 400 });
    }

    console.log('✅ Generating recipe for:', { 
      user: session.user.email,
      ingredients, 
      dietary, 
      healthyMode, 
      staples 
    });

    // Build the prompt
    const systemPrompt = `You are Chefini, a culinary wizard who hates food waste. You speak confidently but briefly. 
    
YOUR RULES:
1. Transform random leftovers into gourmet meals
2. ALWAYS provide exactly ONE "Magic Tip" - a scientific reason why flavors work together
3. Respond ONLY in valid JSON format (no markdown, no explanations)
4. Be creative but practical

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "title": "Creative dish name",
  "time": "XX mins",
  "ingredients": [
    {"item": "amount + ingredient", "missing": false}
  ],
  "instructions": ["Step by step array"],
  "macros": {
    "calories": 450,
    "protein": 25,
    "carbs": 50,
    "fats": 15
  },
  "tip": "One scientific Magic Tip explaining flavor chemistry"
}`;

    const staplesText = staples ? ' You can also use kitchen staples like oil, salt, pepper, and common spices.' : '';
    const dietaryText = dietary.length > 0 ? ` DIETARY RESTRICTIONS: ${dietary.join(', ')}.` : '';
    const healthyText = healthyMode ? ' PRIORITY: Make this dish healthy with balanced macros and nutrient-dense ingredients.' : '';

    const userPrompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}.${staplesText}${dietaryText}${healthyText}`;

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in environment variables');
      return NextResponse.json({ 
        error: 'API configuration error. Please add GROQ_API_KEY to your .env.local file.' 
      }, { status: 500 });
    }

    // Call Groq API
    console.log('🤖 Calling Groq API...');
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 2000,
      });
    } catch (groqError: any) {
      console.error('❌ Groq API Error:', groqError.message);
      return NextResponse.json({ 
        error: 'AI service error: ' + groqError.message 
      }, { status: 503 });
    }

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('📝 AI Response received, length:', responseText.length);

    // Parse JSON response
    let recipeData;
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      recipeData = JSON.parse(cleanJson);
      console.log('✅ Recipe parsed successfully:', recipeData.title);
    } catch (parseError) {
      console.error('❌ JSON Parse Error. Raw response:', responseText);
      return NextResponse.json({ 
        error: 'Failed to parse AI response. Please try again.' 
      }, { status: 500 });
    }

    // Validate recipe structure
    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
      console.error('❌ Invalid recipe structure:', recipeData);
      return NextResponse.json({ 
        error: 'Invalid recipe format. Please try again.' 
      }, { status: 500 });
    }

    // Mark missing ingredients (more flexible matching)
    const userIngredients = ingredients.map((i: string) => i.toLowerCase().trim());
    recipeData.ingredients = recipeData.ingredients.map((ing: any) => {
      const ingItem = ing.item.toLowerCase();
      const isMissing = !userIngredients.some(ui => {
        // Check if user ingredient is in recipe ingredient or vice versa
        return ingItem.includes(ui) || ui.includes(ingItem.split(' ').pop() || '');
      });
      
      return {
        ...ing,
        missing: isMissing
      };
    });

    // Save to database
    try {
      console.log('💾 Connecting to database...');
      await dbConnect();
      
      const recipe = await Recipe.create({
        ...recipeData,
        createdBy: session.user.id,
        isPublic: false,
      });
      
      console.log('✅ Recipe saved to database with ID:', recipe._id);

      return NextResponse.json({ 
        recipe: recipeData, 
        recipeId: recipe._id 
      });
    } catch (dbError: any) {
      console.error('❌ Database Error:', dbError.message);
      // Still return the recipe even if saving fails
      return NextResponse.json({ 
        recipe: recipeData,
        warning: 'Recipe generated but not saved to database.'
      });
    }

  } catch (error: any) {
    console.error('❌ Unexpected Generate API Error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred: ' + error.message 
    }, { status: 500 });
  }
}