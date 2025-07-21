
'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from '@/hooks/use-auth';

// Hardcoded Supabase credentials for server-side actions.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTA3MjksImV4cCI6MjA2ODY2NjcyOX0.x-f4IqCoUCLweM4PS152zHqWT2bdtp-p_nIu0Wcs1rQ";


export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }): Promise<{ error: string | null; user: User | null }> {
    
    // We must create a new client here on the server to use the service_role key
    // This allows us to bypass RLS and query the employees table for the email address
    const supabaseAdmin = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    );
    
    if (!employeeId) {
      return { error: "Employee ID is required.", user: null };
    }
    
    const { data: employee, error: queryError } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(name)')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (queryError || !employee) {
      console.error("Employee ID lookup error:", queryError);
      return { error: "Employee ID not found.", user: null };
    }
    
    // This client handles session management (cookies)
    const cookieStore = cookies();
    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name, options) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    );

    // Directly sign in with password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: employee.email,
        password: password,
    });
    
    if (signInError) {
        console.error("Sign in error:", signInError);
        return { error: "Invalid password.", user: null };
    }
    
    if (!signInData.user) {
        return { error: "Login failed. Please try again.", user: null };
    }

    // Construct the user object to return to the client
    const user: User = {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        profile: employee
    };
    
    return { error: null, user };
}

export async function verifyOtp({ email, otp }: { email: string, otp: string }): Promise<{ success: boolean; error?: string }> {
    const cookieStore = cookies();
    const supabase = createClient(
        SUPABASE_URL,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTA3MjksImV4cCI6MjA2ODY2NjcyOX0.x-f4IqCoUCLweM4PS152zHqWT2bdtp-p_nIu0Wcs1rQ",
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                set(name, value, options) { cookieStore.set({ name, value, ...options }) },
                remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
            },
        }
    );

    const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
    });

    if (error) {
        console.error("OTP verification error:", error);
        return { success: false, error: "Invalid OTP. Please check your email and try again." };
    }

    return { success: true };
}
