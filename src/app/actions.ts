

'use server';

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User, UserProfile } from '@/hooks/use-auth';

// Hardcoded Supabase credentials for server-side actions.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";

const demoAccounts = [
    { role: 'admin', user: 'PEP0001', pass: 'password' },
    { role: 'hr', user: 'PEP0002', pass: 'password' },
    { role: 'manager', user: 'PEP0003', pass: 'password' },
    { role: 'recruiter', user: 'PEP0004', pass: 'password' },
    { role: 'qa-analyst', user: 'PEP0005', pass: 'password' },
    { role: 'process-manager', user: 'PEP0006', pass: 'password' },
    { role: 'team-leader', user: 'PEP0007', pass: 'password' },
    { role: 'marketing', user: 'PEP0008', pass: 'password' },
    { role: 'finance', user: 'PEP0009', pass: 'password' },
    { role: 'it-manager', user: 'PEP0010', pass: 'password' },
    { role: 'operations-manager', user: 'PEP0011', pass: 'password' },
    { role: 'employee', user: 'PEP0012', pass: 'password123' },
    { role: 'employee', user: 'PEP0013', pass: 'password123' },
    { role: 'employee', user: 'PEP0014', pass: 'password123' },
    { role: 'employee', user: 'PEP0015', pass: 'password123' },
    { role: 'employee', user: 'PEP0016', pass: 'password123' },
];

export async function loginWithEmployeeId({ employeeId, password }: { employeeId: string, password: string }): Promise<{ error: string | null; role: UserProfile['role'] | null }> {
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check against the hardcoded list of demo accounts
    const account = demoAccounts.find(acc => acc.user === employeeId.toUpperCase() && acc.pass === password);

    if (!account) {
        return { error: "Invalid Employee ID or Password.", role: null };
    }

    // 2. If credentials match, find the full employee profile from the database
    const { data: employee, error: queryError } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(name)')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (queryError || !employee) {
      console.error("Employee lookup failed after credential match:", queryError);
      return { error: "Could not find employee profile.", role: null };
    }
    
    const user: User = {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        profile: employee
    };
    
    // 3. Manually set a user profile cookie.
    try {
        const cookieStore = cookies();
        cookieStore.set({
          name: 'user-profile',
          value: JSON.stringify(user),
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 // 1 day
        });
    } catch (e) {
        console.error("Error setting cookie:", e);
        return { error: "Could not create a session.", role: null };
    }
    
    return { error: null, role: user.role };
}
