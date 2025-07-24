
'use server';

import { revalidatePath } from "next/cache";

// Mock data, in a real app this would be a database.
let mockLeaveRequests = [
    { id: 'leave-001', employee_id: 'user-012', employees: { full_name: 'Anika Sharma' }, leave_type: 'Paid Time Off', start_date: '2024-08-05', end_date: '2024-08-07', days: 3, reason: 'Family vacation', status: 'Approved' },
    { id: 'leave-002', employee_id: 'user-013', employees: { full_name: 'Rohan Verma' }, leave_type: 'Sick Leave', start_date: '2024-08-01', end_date: '2024-08-01', days: 1, reason: 'Fever', status: 'Approved' },
    { id: 'leave-003', employee_id: 'user-014', employees: { full_name: 'Priya Mehta' }, leave_type: 'Casual Leave', start_date: '2024-08-12', end_date: '2024-08-12', days: 1, reason: 'Personal appointment', status: 'Pending' },
];

export async function getLeaveRequests(employeeId?: string, status?: 'Pending' | 'Approved' | 'Rejected') {
    let requests = mockLeaveRequests;
    if (employeeId) {
        requests = requests.filter(r => r.employee_id === employeeId);
    }
    if (status) {
        requests = requests.filter(r => r.status === status);
    }
    return Promise.resolve(requests);
}

export async function getLeaveBalances(employeeId: string) {
    const approvedLeaves = mockLeaveRequests.filter(r => r.employee_id === employeeId && r.status === 'Approved');
    
    const sickUsed = approvedLeaves.filter(r => r.leave_type === 'Sick Leave').reduce((acc, r) => acc + r.days, 0);
    const casualUsed = approvedLeaves.filter(r => r.leave_type === 'Casual Leave').reduce((acc, r) => acc + r.days, 0);
    const ptoUsed = approvedLeaves.filter(r => r.leave_type === 'Paid Time Off').reduce((acc, r) => acc + r.days, 0);

    return Promise.resolve({
        sick: 7 - sickUsed,
        casual: 12 - casualUsed,
        pto: 20 - ptoUsed
    });
}

export async function handleLeaveAction(requestId: string, status: 'Approved' | 'Rejected') {
    const requestIndex = mockLeaveRequests.findIndex(r => r.id === requestId);
    if(requestIndex > -1) {
        mockLeaveRequests[requestIndex].status = status;
        revalidatePath('/[role]/leaves', 'page');
        return { success: true };
    }
    return { success: false, message: 'Request not found' };
}


export async function applyForLeaveAction(formData: FormData) {
    const fromDate = formData.get('from-date') as string;
    const toDate = formData.get('to-date') as string;

    const rawData = {
      leaveType: formData.get('leave-type') as "Sick Leave" | "Casual Leave" | "Paid Time Off" | "Work From Home",
      fromDate: fromDate,
      toDate: toDate,
      reason: formData.get('reason') as string,
    };
    
    const days = (new Date(rawData.toDate).getTime() - new Date(rawData.fromDate).getTime()) / (1000 * 3600 * 24) + 1;

    const newRequest = {
        id: `leave-${Date.now()}`,
        employee_id: 'user-012', // Mock current user
        employees: { full_name: 'Anika Sharma' },
        leave_type: rawData.leaveType,
        start_date: new Date(rawData.fromDate).toISOString(),
        end_date: new Date(rawData.toDate).toISOString(),
        days: days,
        reason: rawData.reason,
        status: 'Pending' as const,
    };
    
    mockLeaveRequests.unshift(newRequest);

    revalidatePath('/[role]/leaves', 'page');
    return { success: true };
}
