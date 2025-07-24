
'use server';

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getLeaveRequests(employeeId?: string, status?: 'Pending' | 'Approved' | 'Rejected') {
    const supabase = createServerClient();
    let query = supabase.from('leave_requests').select(`*, employees (full_name)`);

    if (employeeId) {
        query = query.eq('employee_id', employeeId);
    }
    if (status) {
        query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leave requests:', error);
        return [];
    }
    return data;
}

export async function getLeaveBalances(employeeId: string) {
    // This is a simplified version. In a real app, this would be a more complex query
    // or a dedicated table for balances.
    const supabase = createServerClient();
    const { data, error } = await supabase.from('leave_requests')
        .select('leave_type, days')
        .eq('employee_id', employeeId)
        .eq('status', 'Approved');

    if (error) {
        console.error('Error fetching leave balances:', error);
        return { sick: 0, casual: 0, pto: 0 };
    }

    const sickUsed = data.filter(r => r.leave_type === 'Sick Leave').reduce((acc, r) => acc + r.days, 0);
    const casualUsed = data.filter(r => r.leave_type === 'Casual Leave').reduce((acc, r) => acc + r.days, 0);
    const ptoUsed = data.filter(r => r.leave_type === 'Paid Time Off').reduce((acc, r) => acc + r.days, 0);

    return {
        sick: 7 - sickUsed,
        casual: 12 - casualUsed,
        pto: 20 - ptoUsed
    };
}

export async function handleLeaveAction(requestId: string, status: 'Approved' | 'Rejected') {
    const supabase = createServerClient();
    const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', requestId);

    if (error) {
        console.error('Error updating leave request:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
}


export async function applyForLeaveAction(formData: FormData) {
    const supabase = createServerClient();
    
    const fromDate = formData.get('from-date') as string;
    const toDate = formData.get('to-date') as string;

    const rawData = {
      leaveType: formData.get('leave-type') as "Sick Leave" | "Casual Leave" | "Paid Time Off" | "Work From Home",
      fromDate: fromDate,
      toDate: toDate,
      reason: formData.get('reason') as string,
    };
    
    const days = (new Date(rawData.toDate).getTime() - new Date(rawData.fromDate).getTime()) / (1000 * 3600 * 24) + 1;

    const { error } = await supabase.from('leave_requests').insert({
        employee_id: 'user-012', // Mock current user
        leave_type: rawData.leaveType,
        start_date: new Date(rawData.fromDate).toISOString(),
        end_date: new Date(rawData.toDate).toISOString(),
        reason: rawData.reason,
        days: days,
    });
    
    if(error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/[role]/leaves', 'page');
    return { success: true };
}
