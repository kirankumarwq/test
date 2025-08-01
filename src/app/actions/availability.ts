'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addAvailability(prevState: any, formData: FormData) {
  const supabase = createClient();

  // 1. Authenticate and authorize the user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'You must be logged in to add availability.', error: true };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'doctor') {
    return { message: 'Only doctors can add availability.', error: true };
  }

  // 2. Validate form data
  const date = formData.get('date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  if (!date || !startTime || !endTime) {
    return { message: 'Please fill out all fields.', error: true };
  }

  // 3. Create timestamps
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { message: 'Invalid date or time format.', error: true };
  }

  if (startDateTime >= endDateTime) {
    return { message: 'Start time must be before end time.', error: true };
  }

  // 4. Insert into the database
  const { error } = await supabase.from('availability').insert({
    doctor_id: user.id,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
  });

  if (error) {
    // Handle potential database errors, e.g., unique constraint violation
    if (error.code === '23505') { // unique_violation
        return { message: 'This time slot is already in your schedule.', error: true };
    }
    console.error('Supabase error:', error);
    return { message: 'Failed to add availability. Please try again.', error: true };
  }

  // 5. Revalidate the path to update the UI
  revalidatePath('/doctor/dashboard');

  return { message: `Successfully added availability for ${startDateTime.toLocaleDateString()}.` };
}
