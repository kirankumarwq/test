import { NextResponse } from 'next/server';
import { getSpecialtiesFromSymptoms } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server'; // Assuming server client setup

export async function POST(request: Request) {
  try {
    // 1. Check for user authentication (optional but recommended)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the request body
    const { symptoms } = await request.json();
    if (!symptoms || typeof symptoms !== 'string' || symptoms.length < 5) {
      return NextResponse.json({ error: 'Invalid symptoms provided.' }, { status: 400 });
    }

    // 3. Get recommendations from the AI model
    const specialties = await getSpecialtiesFromSymptoms(symptoms);

    // 4. (Optional) Validate specialties against your database
    // This ensures the AI doesn't recommend a specialty you don't have doctors for.
    // const { data: existingSpecialties, error } = await supabase
    //   .from('specialties')
    //   .select('name')
    //   .in('name', specialties);
    //
    // if (error) throw error;
    // const validSpecialties = existingSpecialties.map(s => s.name);

    // 5. Return the recommended specialties
    return NextResponse.json({ specialties });

  } catch (error) {
    console.error('[Symptom Triage API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process your request.', details: errorMessage }, { status: 500 });
  }
}
