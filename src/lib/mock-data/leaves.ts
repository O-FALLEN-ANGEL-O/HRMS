
export type LeaveBalance = {
    type: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Comp Off';
    balance: number;
};

export type LeaveRequest = {
    id: string;
    employee: string;
    leaveType: 'Sick Leave' | 'Casual Leave' | 'Paid Time Off' | 'Work From Home';
    dates: string;
    days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
};

export const leaveBalances: LeaveBalance[] = [
    { type: 'Sick Leave', balance: 10 },
    { type: 'Casual Leave', balance: 5 },
    { type: 'Earned Leave', balance: 12 },
    { type: 'Comp Off', balance: 2 },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'LR-001',
    employee: 'Ravi Kumar',
    leaveType: 'Sick Leave',
    dates: '2023-11-10 to 2023-11-11',
    days: 2,
    status: 'Pending',
    reason: 'Fever and cold.'
  },
  {
    id: 'LR-002',
    employee: 'Sunita Sharma',
    leaveType: 'Casual Leave',
    dates: '2023-11-15',
    days: 1,
    status: 'Approved',
    reason: 'Personal appointment.'
  },
    {
    id: 'LR-003',
    employee: 'John Doe',
    leaveType: 'Paid Time Off',
    dates: '2023-12-20 to 2023-12-28',
    days: 7,
    status: 'Pending',
    reason: 'Family vacation for the holidays.'
  },
  {
    id: 'LR-004',
    employee: 'Michael Johnson',
    leaveType: 'Sick Leave',
    dates: '2023-11-01',
    days: 1,
    status: 'Rejected',
    reason: 'Did not provide medical certificate as per policy.'
  },
];
