
'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from '@/hooks/use-auth';

// Hardcoded Supabase credentials for server-side actions.
// This is a temporary measure for this specific environment to ensure functionality.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";

export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }): Promise<{ error: string | null; user: User | null, otpRequired: boolean }> {
    
    // We must create a new client here on the server to use the service_role key
    // This allows us to bypass RLS and query the employees table for the email address
    const supabaseAdmin = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    );
    
    if (!employeeId) {
      return { error: "Employee ID is required.", user: null, otpRequired: false };
    }
    
    const { data: employee, error: queryError } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(name)')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (queryError || !employee) {
      console.error("Employee ID lookup error:", queryError);
      return { error: "Employee ID not found.", user: null, otpRequired: false };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Step 1: Validate password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: employee.email,
        password: password,
    });
    
    if (signInError) {
        console.error("Sign in error:", signInError);
        return { error: signInError.message, user: null, otpRequired: false };
    }

    // Since password is correct, create a temporary user object for the OTP step
    const user: User = {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        profile: employee
    };
    
    // Step 2: Password is correct. Now sign out to invalidate the password session
    // and send an OTP for a new passwordless session. This is the 2FA step.
    await supabase.auth.signOut(); 
    const { error: otpError } = await supabase.auth.signInWithOtp({
        email: employee.email,
        options: {
            shouldCreateUser: false,
        }
    });

    if (otpError) {
        console.error("OTP send error:", otpError);
        return { error: "Could not send OTP. Please try again.", user: null, otpRequired: false };
    }

    // Signal to the client that OTP is now required for all roles
    return { error: null, user, otpRequired: true };
}

export async function verifyOtp({ email, otp }: { email: string, otp: string }): Promise<{ success: boolean; error?: string }> {
    const cookieStore = cookies();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
