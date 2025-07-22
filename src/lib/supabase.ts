import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL or Anon Key is not set. Supabase client not initialized.');
  // In a non-browser environment (like during build), we can assign a null-like object
  // to prevent crashes on import, but auth/db calls will fail.
  // The useAuth hook will handle this case for build purposes.
  supabase = {} as any;
}

export { supabase };
