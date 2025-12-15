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

        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ valid: true }); // Empty input is handled by UI
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a content moderator for a cooking app. 
          Analyze the user input. It should be a food ingredient, a dish name, or a cooking-related question.
          
          If the input is:
          1. Offensive, hate speech, or inappropriate -> INVALID
          2. Complete gibberish (random characters) -> INVALID
          3. Clearly not related to food/cooking contexts -> INVALID
          4. Valid food/cooking text -> VALID

          Respond with ONLY JSON: { "valid": boolean, "reason": "short explanation for user" }`
                },
                { role: 'user', content: text }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            max_tokens: 100,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        const jsonStr = responseText.replace(/```json\n?|```/g, '').trim();

        let result;
        try {
            result = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Moderation parse error', e);
            // Fail open if AI fails, strict blocking might annoy users if AI hallucinates format
            return NextResponse.json({ valid: true });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Validation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
