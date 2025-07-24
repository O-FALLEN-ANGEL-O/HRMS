
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Server not configured for database access.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function getLeaveRequests(employeeId?: string, status?: 'Pending' | 'Approved' | 'Rejected') {
    const supabase = getSupabaseAdmin();
    let query = supabase
        .from('leave_requests')
        .select(`
            *,
            employees ( full_name )
        `);
    
    if (employeeId) {
        query = query.eq('employee_id', employeeId);
    }
    if (status) {
        query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if(error) {
        console.error("Error fetching leave requests:", error);
        return [];
    }
    return data;
}

export async function getLeaveBalances(employeeId: string) {
    const supabase = getSupabaseAdmin();
    
    const { data: approvedLeaves, error } = await supabase
        .from('leave_requests')
        .select('leave_type, days')
        .eq('employee_id', employeeId)
        .eq('status', 'Approved');

    if(error) {
        console.error("Error fetching leave balances:", error);
        return { sick: 0, casual: 0, pto: 0 };
    }
    
    const sickUsed = approvedLeaves.filter(r => r.leave_type === 'Sick Leave').reduce((acc, r) => acc + r.days, 0);
    const casualUsed = approvedLeaves.filter(r => r.leave_type === 'Casual Leave').reduce((acc, r) => acc + r.days, 0);
    const ptoUsed = approvedLeaves.filter(r => r.leave_type === 'Paid Time Off').reduce((acc, r) => acc + r.days, 0);

    // In a real app, these allowances would come from the database per country policy
    return {
        sick: 7 - sickUsed,
        casual: 12 - casualUsed,
        pto: 20 - ptoUsed
    };
}

export async function handleLeaveAction(requestId: string, status: 'Approved' | 'Rejected') {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', requestId);
    
    if(error) {
        console.error("Error updating leave request:", error);
        return { success: false, message: error.message };
    }
    
    revalidatePath('/[role]/leaves', 'page');
    return { success: true };
}


export async function applyForLeaveAction(formData: FormData) {
    const supabase = getSupabaseAdmin();
    const fromDate = formData.get('from-date') as string;
    const toDate = formData.get('to-date') as string;
    // This should come from the logged-in user context
    const mockEmployeeId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Corresponds to Anika Sharma in seed

    const rawData = {
      leaveType: formData.get('leave-type') as "Sick Leave" | "Casual Leave" | "Paid Time Off" | "Work From Home",
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason: formData.get('reason') as string,
    };
    
    const days = (rawData.toDate.getTime() - rawData.fromDate.getTime()) / (1000 * 3600 * 24) + 1;

    const { error } = await supabase
        .from('leave_requests')
        .insert({
            employee_id: mockEmployeeId,
            leave_type: rawData.leaveType,
            start_date: rawData.fromDate.toISOString(),
            end_date: rawData.toDate.toISOString(),
            days: days,
            reason: rawData.reason,
            status: 'Pending',
        });

    if(error) {
        console.error("Error applying for leave:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/[role]/leaves', 'page');
    return { success: true };
}
