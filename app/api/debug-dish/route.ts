import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dish, issue, context } = await req.json();

    if (!dish || !issue) {
      return NextResponse.json({ error: 'Missing dish name or issue type' }, { status: 400 });
    }

    // Map issue IDs to descriptive text
    const issueMap: Record<string, string> = {
      salty: 'too salty',
      acidic: 'too sour/acidic',
      spicy: 'too spicy',
      sweet: 'too sweet',
      bland: 'tastes bland',
      burnt: 'slightly burnt'
    };

    const issueDescription = issueMap[issue] || issue;

    const systemPrompt = `You are Chefini's Head of Flavor Rescue, an expert in food chemistry and culinary problem-solving.

Your job is to diagnose cooking mistakes and provide scientific fixes using culinary techniques.

RESPONSE FORMAT (JSON ONLY):
{
  "diagnosis": "Brief explanation of WHY this happened (1-2 sentences, scientific but accessible)",
  "fix_title": "The key solution ingredient or technique (short, actionable)",
  "instruction": "Step-by-step how to apply the fix (2-3 sentences, clear and practical)"
}

RULES:
- Be direct and practical
- Focus on chemistry (acids balance salt, fats coat heat receptors, etc.)
- Give specific measurements when possible
- Keep it conversational but professional
- Use the additional context provided to give MORE SPECIFIC and ACCURATE solutions
- If context mentions specific ingredients or methods, tailor your fix accordingly
- DO NOT include markdown, code blocks, or extra formatting
- Return ONLY valid JSON`;

    let userPrompt = `Dish: ${dish}
Problem: The dish is ${issueDescription}`;

    // Add context if provided
    if (context && context.trim()) {
      userPrompt += `

Additional Context: ${context.trim()}

Use this context to provide a more specific and accurate fix.`;
    }

    userPrompt += `

Provide a scientific fix using culinary chemistry principles.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6, 
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Clean and parse JSON
    let cleanJson = responseText.trim();
    
    // Remove markdown code blocks if present
    cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const data = JSON.parse(cleanJson);

    // Validate response structure
    if (!data.diagnosis || !data.fix_title || !data.instruction) {
      throw new Error('Invalid response structure from AI');
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Flavor Debugger Error:', error);
    
    // Return user-friendly error
    return NextResponse.json({ 
      error: 'Unable to calculate fix. Please try again or rephrase your issue.' 
    }, { status: 500 });
  }
}