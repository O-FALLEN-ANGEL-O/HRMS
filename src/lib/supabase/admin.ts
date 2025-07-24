// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// IMPORTANT: This function should only be used in server-side code
// (e.g., server components, server actions, API routes).
export function createSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    // Check for missing or placeholder environment variables
    if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL_HERE') || 
        !supabaseServiceKey || supabaseServiceKey.includes('YOUR_SUPABASE_SERVICE_KEY')) {
        throw new Error(
            'Supabase URL or Service Role Key is not defined or is still set to the placeholder value in .env.local. Please update it with your actual Supabase credentials.'
        );
    }
    
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
