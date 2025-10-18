import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

export function initializeSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not set. Please check your .env file.');
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey);
  return supabase;
}

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabase;
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase Error:', error);
  throw new Error(error.message || 'Database operation failed');
}

// Helper function to extract data from Supabase response
export function extractData<T>(response: { data: T | null; error: any }): T {
  if (response.error) {
    handleSupabaseError(response.error);
  }
  return response.data as T;
}
