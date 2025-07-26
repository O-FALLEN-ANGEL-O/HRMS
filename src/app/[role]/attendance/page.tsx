
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
import { Plus, Check, X, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
const detailedAttendanceLog: Record<string, { status: 'P' | 'A' | 'L' | 'WO' | 'H', checkIn?: string, checkOut?: string, totalHours?: string }> = {
    [format(new Date(), 'yyyy-MM-dd')]: { status: 'P', checkIn: '09:01', checkOut: '18:05', totalHours: '9h 4m' },
    [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: { status: 'P', checkIn: '08:58', checkOut: '17:59', totalHours: '9h 1m' },
    [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: { status: 'A' },
    [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: { status: 'H' },
    [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: { status: 'P', checkIn: '09:10', checkOut: '18:15', totalHours: '9h 5m' },
    [format(subDays(new Date(), 5), 'yyyy-MM-dd')]: { status: 'L' },
    [format(subDays(new Date(), 6), 'yyyy-MM-dd')]: { status: 'WO' },
    [format(subDays(new Date(), 7), 'yyyy-MM-dd')]: { status: 'WO' },
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
        // Defensive check to ensure date is valid before formatting
        if (!isValid(date)) {
            return null;
        }
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = detailedAttendanceLog[dateKey];
        
        if (!dayData) return null;

        const getStatusClass = (status: string) => {
            switch (status) {
                case 'P': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                case 'A': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                case 'L': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                case 'WO': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
                case 'H': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
                default: return '';
            }
        }
        
        return (
            <div className='absolute inset-0 p-1 text-xs text-left overflow-hidden flex flex-col justify-between'>
                <div>
                  <div className='flex justify-end'>
                     <Badge variant="secondary" className={`h-5 w-5 p-0 justify-center font-bold ${getStatusClass(dayData.status)}`}>{dayData.status}</Badge>
                  </div>
                </div>
                {dayData.status === 'P' && (
                    <div className='space-y-0.5'>
                        <p className='text-muted-foreground'>{dayData.checkIn} - {dayData.checkOut}</p>
                        <p>Total: <span className='font-semibold'>{dayData.totalHours}</span></p>
                    </div>
                )}
            </div>
        )
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div>
                        <CardTitle>My Attendance</CardTitle>
                        <CardDescription>Review your monthly attendance, leaves, and holidays.</CardDescription>
                     </div>
                      <div className="flex items-center gap-2">
                            <Select value={getYear(month).toString()} onValueChange={handleYearChange}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Year"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={getMonth(month).toString()} onValueChange={handleMonthChange}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Month"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> Regularization</Button>
                      </div>
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
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Present</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span>Absent</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Leave</div>
                         <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500"></span>Holiday</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground/30"></span>Week Off</div>
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
                                                <Badge variant={log.status === 'A' ? 'destructive' : 'outline'}>{log.status}</Badge>
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
