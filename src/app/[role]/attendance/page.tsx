
'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { subDays, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

const ApplyLeaveDialog = dynamic(() => import('@/components/leaves/apply-leave-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Apply for Leave</Button>,
    ssr: false
});


const mockLeaveRequests = [
    { id: 'LR-001', employee: 'Anika Sharma', type: 'Sick Leave', dates: '15/07/24 - 16/07/24', days: 2, reason: 'Flu', status: 'Approved' },
    { id: 'LR-002', employee: 'Rohan Verma', type: 'Casual Leave', dates: '22/07/24 - 26/07/24', days: 5, reason: 'Family vacation', status: 'Approved' },
    { id: 'LR-003', employee: 'Priya Mehta', type: 'Work From Home', dates: '29/07/24 - 29/07/24', days: 1, reason: 'Plumber visit', status: 'Pending' },
];

const getStatusBadge = (status: string) => {
    switch (status) {
    case 'Approved':
        return <Badge variant="default" className='bg-green-500 hover:bg-green-600'>Approved</Badge>;
    case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
    case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    default:
        return <Badge>{status}</Badge>;
    }
};

function LeaveActionButtons({ requestId }: { requestId: string }) {
    const { toast } = useToast();
    const handleAction = (status: 'Approved' | 'Rejected') => {
        toast({ title: 'Action Triggered', description: `Request ${requestId} has been ${status}.` });
    };

    return (
        <div className='flex gap-2 justify-end'>
            <Button variant="outline" size="icon" className='border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600' onClick={() => handleAction('Approved')}><Check className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className='border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600' onClick={() => handleAction('Rejected')}><X className="h-4 w-4" /></Button>
        </div>
    );
}

const attendanceData = {
    present: [new Date(), subDays(new Date(), 1), subDays(new Date(), 4)],
    absent: [subDays(new Date(), 2)],
    leave: [subDays(new Date(), 8), subDays(new Date(), 9), subDays(new Date(), 10)],
    dayOff: [subDays(new Date(), 6), subDays(new Date(), 7)],
    holidays: [subDays(new Date(), 3)],
    halfDay: [subDays(new Date(), 5)],
};

const attendanceLog = [
    { date: '2024-07-29', checkIn: '09:01 AM', checkOut: '06:05 PM', hours: '9h 4m' },
    { date: '2024-07-28', checkIn: '09:05 AM', checkOut: '06:00 PM', hours: '8h 55m' },
    { date: '2024-07-27', checkIn: '-', checkOut: '-', hours: 'Absent' },
    { date: '2024-07-26', checkIn: '09:15 AM', checkOut: '06:10 PM', hours: '8h 55m' },
];


export default function AttendancePage() {
    const params = useParams();
    const role = params.role as string;
    const isManager = role === 'manager' || role === 'hr' || role === 'admin';
    
    const applyForLeaveAction = async (formData: FormData) => {
        console.log("Mock Action: Applying for leave with data:", Object.fromEntries(formData));
        return { success: true };
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Calendar</CardTitle>
                    <CardDescription>View your monthly attendance, leaves, and holidays.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Calendar
                        mode="multiple"
                        modifiers={attendanceData}
                        modifiersClassNames={{
                            present: 'rdp-day_present',
                            absent: 'rdp-day_absent',
                            leave: 'rdp-day_leave',
                            dayOff: 'rdp-day_dayOff',
                            holidays: 'rdp-day_holiday',
                            halfDay: 'rdp-day_half-day',
                        }}
                    />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center p-4 border-t mt-4 text-sm">
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Present</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span>Absent</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Leave</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500"></span>Holiday</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground/30"></span>Week Off</div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="log">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="log">Attendance Log</TabsTrigger>
                    <TabsTrigger value="requests">Leave Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="log">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Attendance Log</CardTitle>
                                <CardDescription>Your check-in and check-out history.</CardDescription>
                            </div>
                            <Button><Plus className="mr-2 h-4 w-4"/> Request Regularization</Button>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Check-in</TableHead>
                                        <TableHead>Check-out</TableHead>
                                        <TableHead>Working Hours</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceLog.map((log) => (
                                        <TableRow key={log.date}>
                                            <TableCell>{log.date}</TableCell>
                                            <TableCell>{log.checkIn}</TableCell>
                                            <TableCell>{log.checkOut}</TableCell>
                                            <TableCell>
                                                <Badge variant={log.hours === 'Absent' ? 'destructive' : 'outline'}>{log.hours}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="requests">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Leave Requests</CardTitle>
                            <CardDescription>{isManager ? "All leave requests from your team." : "Your leave request history."}</CardDescription>
                          </div>
                          <Suspense fallback={<Button disabled>Loading...</Button>}>
                             <ApplyLeaveDialog action={applyForLeaveAction} />
                          </Suspense>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>{isManager ? 'Employee' : 'Request ID'}</TableHead>
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                {isManager && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {mockLeaveRequests.map((request) => (
                                <TableRow key={request.id}>
                                <TableCell className="font-medium">{isManager ? request.employee : request.id}</TableCell>
                                <TableCell>{request.type}</TableCell>
                                <TableCell>{request.dates}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                {isManager && (
                                    <TableCell className="text-right">
                                    {request.status === 'Pending' ? (
                                        <LeaveActionButtons requestId={request.id} />
                                    ) : (
                                        <span>-</span>
                                    )}
                                    </TableCell>
                                )}
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
