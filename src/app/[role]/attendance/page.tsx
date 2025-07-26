
'use client';

import { useState, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, getMonth, getYear, setMonth, setYear, subDays, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Check, X, Loader2, Calendar as CalendarIcon, Briefcase, Clock, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Enhanced attendance data for detailed calendar view
const detailedAttendanceLog: Record<string, { status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday', checkIn?: string, checkOut?: string, totalHours?: string, location: 'Office' | 'Home' }> = {
    [format(subDays(new Date(), 0), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '09:01', checkOut: '18:05', totalHours: '9h 4m', location: 'Office' },
    [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '08:58', checkOut: '17:59', totalHours: '9h 1m', location: 'Office' },
    [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: { status: 'Absent', location: 'Office' },
    [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: { status: 'Holiday', location: 'Office' },
    [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '09:10', checkOut: '18:15', totalHours: '9h 5m', location: 'Home' },
    [format(subDays(new Date(), 5), 'yyyy-MM-dd')]: { status: 'Leave', location: 'Office' },
    [format(subDays(new Date(), 6), 'yyyy-MM-dd')]: { status: 'Week Off', location: 'Office' },
    [format(subDays(new Date(), 7), 'yyyy-MM-dd')]: { status: 'Week Off', location: 'Office' },
};


export default function AttendancePage() {
    const params = useParams();
    const role = params.role as string;
    const isManager = role === 'manager' || role === 'hr' || role === 'admin';
    
    const [month, setMonth] = useState(new Date());

    const years = useMemo(() => Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(2000, i, 1), 'MMMM') })), []);

    const handleYearChange = (year: string) => {
        setMonth(prev => setYear(prev, parseInt(year)));
    }
    const handleMonthChange = (monthIndex: string) => {
        setMonth(prev => setMonth(prev, parseInt(monthIndex)));
    }

    const applyForLeaveAction = async (formData: FormData) => {
        console.log("Mock Action: Applying for leave with data:", Object.fromEntries(formData));
        return { success: true };
    };

    const DayCellContent = ({ date }: { date: Date }) => {
        if (!isValid(date)) {
            return null;
        }
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = detailedAttendanceLog[dateKey];
        
        if (!dayData) return null;

        const getStatusClass = (status: string) => {
            switch (status) {
                case 'Present': return 'bg-green-100 border-green-200 text-green-800';
                case 'Absent': return 'bg-red-100 border-red-200 text-red-800';
                case 'Leave': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
                case 'Week Off': return 'bg-gray-100 border-gray-200 text-gray-800';
                case 'Holiday': return 'bg-purple-100 border-purple-200 text-purple-800';
                default: return '';
            }
        }
        
        return (
            <div className={`absolute bottom-1 left-1 right-1 ${getStatusClass(dayData.status)} rounded-md p-1 text-xs`}>
                {dayData.status === 'Present' ? (
                     <div className='space-y-0.5 text-left'>
                        <p className='text-[10px]'>{dayData.checkIn} - {dayData.checkOut}</p>
                        <p className="font-semibold text-[11px] flex items-center gap-1">
                           {dayData.location === 'Home' ? <Home className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                           {dayData.totalHours}
                        </p>
                    </div>
                ) : (
                    <p className="font-semibold text-center text-[11px]">{dayData.status}</p>
                )}
            </div>
        )
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                         <h2 className="text-xl font-semibold text-gray-700">{format(month, 'MMMM yyyy')}</h2>
                        <Button variant="outline" size="icon" onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                     </div>
                     <Button><Plus className="mr-2 h-4 w-4"/> Attendance Regularization</Button>
                   </div>
                </CardHeader>
                <CardContent>
                     <Calendar
                        month={month}
                        onMonthChange={setMonth}
                        components={{
                            DayContent: DayCellContent
                        }}
                        className="detailed-calendar"
                    />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center p-4 border-t mt-4 text-sm">
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>Present</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>Absent</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>Leave</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>Holiday</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>Week Off</div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="requests">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="log">Attendance Log</TabsTrigger>
                    <TabsTrigger value="requests">Leave Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="log">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your check-in and check-out history.</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Check-in</TableHead>
                                        <TableHead>Check-out</TableHead>
                                        <TableHead>Working Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(detailedAttendanceLog).map(([date, log]) => (
                                        <TableRow key={date}>
                                            <TableCell>{format(new Date(date), 'dd MMM, yyyy')}</TableCell>
                                            <TableCell>{log.checkIn || '-'}</TableCell>
                                            <TableCell>{log.checkOut || '-'}</TableCell>
                                            <TableCell>{log.totalHours || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === 'Absent' ? 'destructive' : 'outline'}>{log.status}</Badge>
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

    