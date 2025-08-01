import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types' // Assuming you'll create a types file from your schema

// Define a function to create the client instance
export function createClient() {
  // Note: These environment variables are safe to be exposed on the client side
  // as long as you have Row Level Security (RLS) enabled on your database.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anonymous key is missing from environment variables.')
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
