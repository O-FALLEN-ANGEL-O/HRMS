

'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from '@/hooks/use-auth';

// Hardcoded Supabase credentials for server-side actions.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTA3MjksImV4cCI6MjA2ODY2NjcyOX0.x-f4IqCoUCLweM4PS152zHqWT2bdtp-p_nIu0Wcs1rQ";


const demoAccounts = [
    { role: 'Admin', user: 'PEP0001', pass: 'password' },
    { role: 'HR', user: 'PEP0002', pass: 'password' },
    { role: 'Manager', user: 'PEP0003', pass: 'password' },
    { role: 'Recruiter', user: 'PEP0004', pass: 'password' },
    { role: 'QA Analyst', user: 'PEP0005', pass: 'password' },
    { role: 'Process Manager', user: 'PEP0006', pass: 'password' },
    { role: 'Team Leader', user: 'PEP0007', pass: 'password' },
    { role: 'Marketing', user: 'PEP0008', pass: 'password' },
    { role: 'Finance', user: 'PEP0009', pass: 'password' },
    { role: 'IT Manager', user: 'PEP0010', pass: 'password' },
    { role: 'Operations Manager', user: 'PEP0011', pass: 'password' },
    { role: 'Employee', user: 'PEP0012', pass: 'password123' },
    { role: 'Employee 2', user: 'PEP0013', pass: 'password123' },
    { role: 'Employee 3', user: 'PEP0014', pass: 'password123' },
    { role: 'Employee 4', user: 'PEP0015', pass: 'password123' },
    { role: 'Employee 5', user: 'PEP0016', pass: 'password123' },
];

export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }): Promise<{ error: string | null; user: User | null }> {
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check against the hardcoded list of demo accounts
    const account = demoAccounts.find(acc => acc.user === employeeId.toUpperCase() && acc.pass === password);

    if (!account) {
        return { error: "Invalid Employee ID or Password.", user: null };
    }

    // 2. If credentials match, find the full employee profile from the database
    const { data: employee, error: queryError } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(name)')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (queryError || !employee) {
      console.error("Employee lookup failed after credential match:", queryError);
      return { error: "Could not find employee profile.", user: null };
    }
    
    // 3. Programmatically set the session for the user
    const cookieStore = cookies();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            set: (name, value, options) => cookieStore.set({ name, value, ...options }),
            remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
        },
    });

    const { error: sessionError } = await supabase.auth.setSession({
        access_token: 'dummy_access_token_for_mock_session', // This is a placeholder as we're not using real auth
        refresh_token: 'dummy_refresh_token_for_mock_session',
    });

    if (sessionError) {
        console.error("Error setting session:", sessionError);
        return { error: "Could not create a session.", user: null };
    }

    // Construct the user object to return to the client
    const user: User = {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        profile: employee
    };
    
    // As we are mocking the session, we need to manually store user info.
    // In a real app, setSession would handle this. We'll use a cookie.
    cookieStore.set({
      name: 'user-profile',
      value: JSON.stringify(user),
      httpOnly: true,
      path: '/',
    });
    
    return { error: null, user };
}
