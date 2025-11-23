import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';  // Changed this line
import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();  // Changed this line

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ingredients, dietary, healthyMode, staples } = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

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
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number
  },
  "tip": "One scientific Magic Tip explaining flavor chemistry"
}`;

    const staplesText = staples ? ' You can also use kitchen staples like oil, salt, pepper, and common spices.' : '';
    const dietaryText = dietary.length > 0 ? ` DIETARY RESTRICTIONS: ${dietary.join(', ')}.` : '';
    const healthyText = healthyMode ? ' PRIORITY: Make this dish healthy with balanced macros and nutrient-dense ingredients.' : '';

    const userPrompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}.${staplesText}${dietaryText}${healthyText}`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let recipeData;
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipeData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      return NextResponse.json({ error: 'Invalid recipe format from AI' }, { status: 500 });
    }

    // Mark missing ingredients
    const userIngredients = ingredients.map((i: string) => i.toLowerCase());
    recipeData.ingredients = recipeData.ingredients.map((ing: any) => ({
      ...ing,
      // Fix: Explicitly type 'ui' as string
      missing: !userIngredients.some((ui: string) => ing.item.toLowerCase().includes(ui))
    }));

    // Save to database
    await dbConnect();
    const recipe = await Recipe.create({
      ...recipeData,
      createdBy: session.user.id,
      isPublic: false,
    });

    return NextResponse.json({ recipe: recipeData, recipeId: recipe._id });

  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}