import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials.
// This approach ensures the client runs in any environment without needing .env files.
const supabaseUrl = "https://qgmknoilorehwimlhngf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTA3MjksImV4cCI6MjA2ODY2NjcyOX0.x-f4IqCoUCLweM4PS152zHqWT2bdtp-p_nIu0Wcs1rQ"

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
