import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AvailabilityManager from '@/components/doctor/AvailabilityManager';
import { addAvailability } from '@/app/actions/availability';

export default async function DoctorDashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch doctor's existing availability
  const { data: availability, error } = await supabase
    .from('availability')
    .select('id, start_time, end_time, is_booked')
    .eq('doctor_id', user.id)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching availability:', error);
    // Optionally, render an error message to the user
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left column for managing availability */}
        <div className="md:col-span-1">
          <AvailabilityManager addAvailability={addAvailability} />
        </div>

        {/* Right column for displaying existing availability */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Your Upcoming Availability</h2>
          <div className="space-y-4">
            {availability && availability.length > 0 ? (
              availability.map((slot) => (
                <div key={slot.id} className={`p-4 rounded-lg shadow-sm ${slot.is_booked ? 'bg-gray-200' : 'bg-white'}`}>
                  <p className="font-semibold">
                    {new Date(slot.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-gray-600">
                    {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {slot.is_booked && (
                    <p className="text-sm font-bold text-red-600 mt-2">Booked</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">You have not added any availability yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
