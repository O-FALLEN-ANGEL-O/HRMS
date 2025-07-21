// src/config/env.ts
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Supabase URL is not set. Please check your environment variables.");
}

if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase Anon Key is not set. Please check your environment variables.");
}
