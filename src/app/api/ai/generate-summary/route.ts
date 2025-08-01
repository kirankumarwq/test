import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Check for user authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the request body
    const { concerns } = await request.json();
    if (!concerns || typeof concerns !== 'string' || concerns.length < 10) {
      return NextResponse.json({ error: 'Please provide a more detailed description of your concerns.' }, { status: 400 });
    }

    // 3. Generate the summary using Gemini
    const prompt = `Summarize the following patient's concerns into a concise, one-sentence summary for a doctor. Focus on the key symptoms and duration. Patient concerns: "${concerns}"`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    // 4. Return the generated summary
    return NextResponse.json({ summary });

  } catch (error) {
    console.error('[Generate Summary API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate summary.', details: errorMessage }, { status: 500 });
  }
}
