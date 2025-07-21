
'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from '@/hooks/use-auth';

export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }): Promise<{ error: string | null; user: User | null, otpRequired: boolean }> {
    
    // We must create a new client here on the server to use the service_role key
    // This allows us to bypass RLS and query the employees table for the email address
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    const user: User = {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        profile: employee
    };

    const otpRequired = user.role === 'admin' || user.role === 'manager';

    if (otpRequired) {
        // Step 2: If password is correct and role requires 2FA, sign out to invalidate password session
        // and send an OTP for a new passwordless session.
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
    }


    return { error: null, user, otpRequired };
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
