
export type LeaveBalance = {
    type: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Comp Off';
    balance: number;
};

export type LeaveRequest = {
    id: string;
    leaveType: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
}

export const leaveBalances: LeaveBalance[] = [
    { type: 'Sick Leave', balance: 10 },
    { type: 'Casual Leave', balance: 5 },
    { type: 'Earned Leave', balance: 12 },
    { type: 'Comp Off', balance: 2 },
];

export const leaveRequests: LeaveRequest[] = [
    {
        id: "LR-001",
        leaveType: "Sick Leave",
        date: "2024-07-20",
        status: "Approved",
        reason: "Fever and cold."
    },
    {
        id: "LR-002",
        leaveType: "Casual Leave",
        date: "2024-08-01",
        status: "Pending",
        reason: "Family function."
    },
    {
        id: "LR-003",
        leaveType: "Earned Leave",
        date: "2024-06-15",
        status: "Rejected",
        reason: "Not enough notice provided."
    },
    {
        id: "LR-004",
        leaveType: "Sick Leave",
        date: "2024-05-10",
        status: "Approved",
        reason: "Doctor's appointment."
    }
];
