import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Groq from 'groq-sdk';

import dbConnect from '@/lib/mongodb';
import BatchPlan from '@/models/BatchPlan';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface BuildStep {
  task: string;
  duration: string;
  temp: string;
  why: string;
}

interface RuntimeRecipe {
  day: number;
  title: string;
  time: string;
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface BatchCompilerOutput {
  batch_title: string;
  total_prep_time: string;
  build_phase: BuildStep[];
  runtime_phase: RuntimeRecipe[];
  storage_tip: string;
}

// ==========================================
// POST HANDLER
// ==========================================
export async function POST(req: NextRequest) {
  try {
    // ============ AUTHENTICATION ============
    const session = await auth();

    if (!session?.user) {
      console.error('❌ Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============ PARSE REQUEST ============
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      ingredients,
      days = 3,           // Default: 3-day meal prep
      dietary = [],       // Dietary restrictions
      cookingLevel = 'intermediate' // beginner | intermediate | advanced
    } = body;

    // ============ HELPER: TITLE CASE ============
    const toTitleCase = (str: string) => {
      return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
      );
    };

    // ============ VALIDATE INPUTS ============
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      console.error('❌ No ingredients provided:', ingredients);
      return NextResponse.json({
        error: 'Please provide at least one ingredient'
      }, { status: 400 });
    }

    // Format ingredients to Title Case
    const formattedIngredients = ingredients.map((i: string) => toTitleCase(i));

    if (days < 2 || days > 5) {
      return NextResponse.json({
        error: 'Days must be between 2 and 5'
      }, { status: 400 });
    }

    console.log('✅ Generating batch plan for:', {
      user: session.user.email,
      ingredients,
      days,
      dietary,
      cookingLevel
    });

    // ============ CHECK API KEY ============
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in environment variables');
      return NextResponse.json({
        error: 'API configuration error. Please add GROQ_API_KEY to your .env.local file.'
      }, { status: 500 });
    }

    // ============ BUILD THE PROMPT ============
    const systemPrompt = `You are Chefini's Batch Compiler — a meal prep architect who thinks like a software engineer.

YOUR MISSION:
Transform bulk ingredients into a "Build Once, Eat All Week" system with two distinct phases:
1. BUILD PHASE (Sunday Prep): Heavy processing tasks done once
2. RUNTIME PHASE (Daily Meals): Quick assembly meals using prepped components

CORE PRINCIPLES:
- Treat cooking like CI/CD: Optimize for reusability, not redundancy
- Build Phase = Backend processing (roast, boil, marinate)
- Runtime Phase = Frontend assembly (mix, plate, serve)
- Each runtime recipe must feel DISTINCT (different cuisines, textures, temperatures)
- Never waste ingredients — use every gram

RESPOND WITH THIS EXACT JSON STRUCTURE (no markdown, no explanations):
{
  "batch_title": "Creative batch name (e.g., 'The Mediterranean Stack')",
  "total_prep_time": "XX mins",
  "build_phase": [
    {
      "task": "What to do (e.g., 'Roast all chicken thighs')",
      "duration": "XX mins",
      "temp": "Temperature/setting (e.g., '200°C' or 'Medium heat')",
      "why": "Engineering reason (e.g., 'Creates reusable protein base')"
    }
  ],
  "runtime_phase": [
    {
      "day": 1,
      "title": "Day 1 meal name",
      "time": "XX mins assembly",
      "instructions": ["Step-by-step array for quick assembly"],
      "macros": {
        "calories": 450,
        "protein": 30,
        "carbs": 40,
        "fats": 15
      }
    }
  ],
  "storage_tip": "One critical storage/reheating tip"
}

CONSTRAINTS:
- Build Phase: 3-6 tasks maximum (keep it manageable)
- Runtime Phase: Exactly ${days} distinct recipes
- Each runtime meal: Under 15 mins assembly time
- Vary cuisines/styles (e.g., Day 1: Asian stir-fry, Day 2: Mexican bowl, Day 3: Italian pasta)`;

    const dietaryText = dietary.length > 0 ? `DIETARY RESTRICTIONS: ${dietary.join(', ')}. ` : '';
    const skillText = cookingLevel === 'beginner' ? 'Keep techniques simple and foolproof. ' :
      cookingLevel === 'advanced' ? 'Feel free to use complex techniques. ' : '';

    const userPrompt = `Create a ${days}-day batch meal prep plan using these ingredients: ${ingredients.join(', ')}.
${dietaryText}${skillText}
Focus on creating a smart "build once, eat all week" system where the Sunday prep makes weekday cooking effortless.`;

    // ============ CALL GROQ API ============
    console.log('🤖 Calling Groq API for batch compilation...');
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7, // Slightly lower for structured output
        max_tokens: 3000,  // More tokens for multi-recipe output
      });
    } catch (groqError: any) {
      console.error('❌ Groq API Error:', groqError.message);
      return NextResponse.json({
        error: 'AI service error: ' + groqError.message
      }, { status: 503 });
    }

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('📝 AI Response received, length:', responseText.length);

    // ============ PARSE JSON RESPONSE ============
    let batchData: BatchCompilerOutput;
    try {
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      batchData = JSON.parse(cleanJson);
      console.log('✅ Batch plan parsed successfully:', batchData.batch_title);
    } catch (parseError) {
      console.error('❌ JSON Parse Error. Raw response:', responseText);
      return NextResponse.json({
        error: 'Failed to parse AI response. Please try again.'
      }, { status: 500 });
    }

    // ============ VALIDATE STRUCTURE ============
    if (!batchData.batch_title ||
      !batchData.build_phase ||
      !batchData.runtime_phase ||
      batchData.runtime_phase.length !== days) {
      console.error('❌ Invalid batch plan structure:', batchData);
      return NextResponse.json({
        error: 'Invalid batch plan format. Please try again.'
      }, { status: 500 });
    }

    // ============ RETURN SUCCESS ============
    console.log('✅ Batch compilation complete!');

    // Save to database
    try {
      await dbConnect();

      const batchPlan = await BatchPlan.create({
        ...batchData,
        ingredients: formattedIngredients,
        days,
        cookingLevel,
        createdBy: session.user.id,
      });

      console.log('✅ Batch plan saved with ID:', batchPlan._id);

      return NextResponse.json({
        success: true,
        batch: batchData,
        batchId: batchPlan._id,
        saved: true,
        meta: {
          user: session.user.email,
          ingredients: ingredients.length,
          days,
          generated_at: new Date().toISOString()
        }
      });
    } catch (dbError: any) {
      console.error('❌ Database Error:', dbError.message);
      // Still return the batch even if saving fails
      return NextResponse.json({
        success: true,
        batch: batchData,
        warning: 'Batch plan generated but not saved to database.',
        meta: {
          user: session.user.email,
          ingredients: ingredients.length,
          days,
          generated_at: new Date().toISOString()
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Unexpected Batch API Error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred: ' + error.message
    }, { status: 500 });
  }
}