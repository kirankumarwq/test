'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AvailabilityManagerProps {
  // This will be a Server Action
  addAvailability: (prevState: any, formData: FormData) => Promise<{ message: string; error?: boolean; }>;
}

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Availability'}
    </Button>
  );
}

export default function AvailabilityManager({ addAvailability }: AvailabilityManagerProps) {
  const [state, formAction] = useFormState(addAvailability, initialState);

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manage Your Availability</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <Input
            type="date"
            id="date"
            name="date"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time (e.g., 09:00)</label>
          <Input
            type="time"
            id="start_time"
            name="start_time"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time (e.g., 10:00)</label>
          <Input
            type="time"
            id="end_time"
            name="end_time"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <SubmitButton />
        {state?.message && (
          <p className={`mt-2 text-sm ${state.error ? 'text-red-500' : 'text-green-500'}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
