import AuthForm from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase's signInWithPassword doesn't throw on error, so we do it manually.
      // In a real app, you might want a more user-friendly error message.
      throw new Error(error.message);
    }

    // Redirect to a protected route, e.g., the patient dashboard
    return redirect('/patient/dashboard');
  };

  // A sign-up function stub to satisfy the component's prop requirements.
  // This page is for logging in, so this function should not be called.
  const signUpStub = async (formData: FormData) => {
    'use server';
    throw new Error("Sign up is not available on the login page.");
  }

  return (
    <div className="container mx-auto pt-16">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      <AuthForm signIn={signIn} signUp={signUpStub} />
    </div>
  );
}
