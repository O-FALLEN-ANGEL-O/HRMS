
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { User } from '@/lib/mock-data/employees';

// This is a server action, so it will only run on the server.
export async function getUserProfileAction(employeeId: string): Promise<{ user: User | null, error: string | null }> {
    
    // We must use the service role key to query the users table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { user: null, error: "Server not configured for authentication." };
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    // 1. Find employee by employee_id
    const { data: employeeData, error: employeeError } = await supabaseAdmin
        .from('employees')
        .select(`
            *,
            department:departments(*)
        `)
        .eq('employee_id', employeeId)
        .single();

    if (employeeError || !employeeData) {
        console.error("Employee not found:", employeeError);
        return { user: null, error: "Employee profile not found." };
    }

    // 2. Get user from auth table using the user_id from the employees table
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(employeeData.user_id);
    if(authError || !authUser) {
        console.error("Auth user not found:", authError);
        return { user: null, error: "Authentication user not found." };
    }

    // 3. Get public user data (for role)
    const { data: publicUser, error: publicUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', employeeData.user_id)
        .single();

    if (publicUserError || !publicUser) {
        console.error("Public user not found:", publicUserError);
        return { user: null, error: "User role not found." };
    }

    const user: User = {
        id: authUser.user.id,
        email: authUser.user.email || '',
        role: publicUser.role,
        profile: {
            // @ts-ignore
            ...employeeData,
            role: publicUser.role,
        }
    };
    
    return { user, error: null };
}
