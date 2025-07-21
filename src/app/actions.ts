
'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }) {
    
    // We must create a new client here on the server to use the service_role key
    // This allows us to bypass RLS and query the employees table for the email address
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    if (!employeeId) {
      return { error: "Employee ID is required." };
    }
    
    const { data: employee, error: queryError } = await supabaseAdmin
      .from('employees')
      .select('email')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (queryError || !employee) {
      console.error("Employee ID lookup error:", queryError);
      return { error: "Employee ID not found." };
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: employee.email,
        password: password,
    });
    
    if (signInError) {
        console.error("Sign in error:", signInError);
        return { error: signInError.message };
    }

    return { error: null };
}
