
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ApplyLeaveDialog from '@/components/leaves/apply-leave-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockEmployees } from '@/lib/mock-data/employees';

// Mock data - In a real app, this would be fetched
const initialLeaveRequests = [
    { id: 'LR-001', employeeId: 'PEP0012', type: 'Sick Leave', from: '2025-07-10', to: '2025-07-10', days: 1, status: 'Approved' },
    { id: 'LR-002', employeeId: 'PEP0013', type: 'Paid Time Off', from: '2025-08-01', to: '2025-08-05', days: 5, status: 'Pending' },
    { id: 'LR-003', employeeId: 'PEP0012', type: 'Work From Home', from: '2025-07-20', to: '2025-07-20', days: 1, status: 'Rejected' },
    { id: 'LR-004', employeeId: 'PEP0014', type: 'Casual Leave', from: '2025-07-25', to: '2025-07-26', days: 2, status: 'Pending' },
];

const leaveBalances = [
    { type: 'Sick Leave', balance: 8 },
    { type: 'Casual Leave', balance: 10 },
    { type: 'Paid Time Off', balance: 14.5 },
];

type LeaveRequest = typeof initialLeaveRequests[0];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Approved': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Pending': return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'Rejected': return <Badge variant="destructive">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

function EmployeeView({ user, requests, setRequests, action }: { user: any; requests: LeaveRequest[]; setRequests: any; action: any }) {
    const userRequests = requests.filter(r => r.employeeId === user.profile.employee_id);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Leave Balances</CardTitle>
                    <CardDescription>Your remaining leave balance for the year.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {leaveBalances.map(balance => (
                        <Card key={balance.type} className="p-4">
                            <p className="text-sm text-muted-foreground">{balance.type}</p>
                            <p className="text-2xl font-bold">{balance.balance} <span className="text-lg font-normal">days</span></p>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Leave Requests</CardTitle>
                    <CardDescription>A history of all your submitted leave requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userRequests.map(request => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.type}</TableCell>
                                    <TableCell>{request.from}</TableCell>
                                    <TableCell>{request.to}</TableCell>
                                    <TableCell>{request.days}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

function ManagerView({ requests, setRequests }: { requests: LeaveRequest[]; setRequests: any }) {
    const { toast } = useToast();

    const handleAction = (requestId: string, newStatus: 'Approved' | 'Rejected') => {
        setRequests((prev: LeaveRequest[]) => 
            prev.map(req => 
                req.id === requestId ? { ...req, status: newStatus } : req
            )
        );
        toast({
            title: `Request ${newStatus}`,
            description: `The leave request has been ${newStatus.toLowerCase()}.`,
        });
    };

    const getEmployeeById = (id: string) => mockEmployees.find(emp => emp.employee_id === id);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Leave Requests</CardTitle>
                <CardDescription>Review and approve leave requests from your team members.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map(request => {
                            const employee = getEmployeeById(request.employeeId);
                            return (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={employee?.profile_picture_url} alt={employee?.full_name} data-ai-hint="person avatar"/>
                                                <AvatarFallback>{employee?.full_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{employee?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{employee?.employee_id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.type}</TableCell>
                                    <TableCell>{request.from} to {request.to}</TableCell>
                                    <TableCell>{request.days}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'Pending' ? (
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="outline" size="sm" onClick={() => handleAction(request.id, 'Approved')}>
                                                    <Check className="mr-2 h-4 w-4 text-green-500"/> Approve
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleAction(request.id, 'Rejected')}>
                                                    <X className="mr-2 h-4 w-4"/> Deny
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Actioned</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function LeavesPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
    const { user } = useAuth();
    const managerRoles = ['admin', 'hr', 'manager', 'team-leader'];
    const isManager = user && managerRoles.includes(user.role);

    const handleApplyLeave = async (formData: FormData): Promise<{success: boolean, message?: string}> => {
        if (!user) return { success: false, message: "User not found" };

        const fromDate = new Date(formData.get('from-date') as string);
        const toDate = new Date(formData.get('to-date') as string);
        const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const newRequest: LeaveRequest = {
            id: `LR-${String(requests.length + 1).padStart(3, '0')}`,
            employeeId: user.profile.employee_id,
            type: formData.get('leave-type') as LeaveRequest['type'],
            from: formData.get('from-date') as string,
            to: formData.get('to-date') as string,
            days: diffDays,
            status: 'Pending',
        };

        await new Promise(res => setTimeout(res, 500)); // Simulate network delay
        
        setRequests(prev => [newRequest, ...prev]);

        return { success: true };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Leave Management</h1>
                    <p className="text-muted-foreground">
                        {isManager ? "Manage your team's time off requests." : "Apply for time off and track your leave history."}
                    </p>
                </div>
                {!isManager && <ApplyLeaveDialog action={handleApplyLeave} />}
            </div>

            {isManager 
                ? <ManagerView requests={requests} setRequests={setRequests} /> 
                : user && <EmployeeView user={user} requests={requests} setRequests={setRequests} action={handleApplyLeave} />
            }
        </div>
    );
}
