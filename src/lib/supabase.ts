
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for use in client-side components
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Note: For server-side operations (like in Server Actions), 
// it's often recommended to create a new client with the service role key
// to bypass Row Level Security if needed. For this prototype, we'll
// use server actions which can use their own secure instance.
