
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key';

// Client for use in client-side components
// NOTE: These are dummy credentials. The mock auth system is currently active.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
