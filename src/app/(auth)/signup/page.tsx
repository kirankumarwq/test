import AuthForm from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function SignupPage() {
  const signUp = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    // In a real app, you'd also pass the user's full name to the metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This email redirect is crucial for email confirmation
        emailRedirectTo: `${headers().get('origin')}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // After sign-up, Supabase sends a confirmation email.
    // You should show a message to the user to check their email.
    // For now, we'll just redirect, but a dedicated "Check your email" page is better.
    return redirect('/?message=Check-email-to-confirm-account');
  };

  // A sign-in function stub to satisfy the component's prop requirements.
  const signInStub = async (formData: FormData) => {
    'use server';
    throw new Error("Sign in is not available on the signup page.");
  }


  return (
    <div className="container mx-auto pt-16">
      <h1 className="text-2xl font-bold text-center mb-8">Create an Account</h1>
      {/*
        This component is initially in "Sign In" mode by default.
        We would need to modify AuthForm to accept an initial state
        or have the user click the "Need an account?" link once.
        For this example, we'll assume the user clicks the link.
      */}
      <AuthForm signUp={signUp} signIn={signInStub} />
    </div>
  );
}
