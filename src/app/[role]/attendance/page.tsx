
'use client';

import { useState, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, getMonth, getYear, setMonth, setYear, isValid, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Check, X, Loader2, Calendar as CalendarIcon, Briefcase, Clock, Home, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ApplyLeaveDialog = dynamic(() => import('@/components/leaves/apply-leave-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Apply for Leave</Button>,
    ssr: false
});

// Enhanced attendance data for detailed calendar view
const detailedAttendanceLog: Record<string, { status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday', checkIn?: string, checkOut?: string, totalHours?: string, location: 'Office' | 'Home' }> = {
    [format(subDays(new Date(), 0), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '09:01', checkOut: '18:05', totalHours: '9h 4m', location: 'Office' },
    [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '08:58', checkOut: '17:59', totalHours: '9h 1m', location: 'Office' },
    [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '09:05', checkOut: '18:00', totalHours: '8h 55m', location: 'Home' },
    [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: { status: 'Holiday', location: 'Office' },
    [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: { status: 'Present', checkIn: '09:10', checkOut: '18:15', totalHours: '9h 5m', location: 'Home' },
    [format(subDays(new Date(), 5), 'yyyy-MM-dd')]: { status: 'Leave', location: 'Office' },
    [format(subDays(new Date(), 6), 'yyyy-MM-dd')]: { status: 'Week Off', location: 'Office' },
    [format(subDays(new Date(), 7), 'yyyy-MM-dd')]: { status: 'Week Off', location: 'Office' },
    [format(subDays(new Date(), 10), 'yyyy-MM-dd')]: { status: 'Absent', location: 'Office' },
};


export default function AttendancePage() {
    const params = useParams();
    const role = params.role as string;
    
    const [month, setMonth] = useState(new Date());

    const DayCellContent = ({ date }: { date: Date }) => {
        if (!isValid(date)) {
            return null;
        }
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = detailedAttendanceLog[dateKey];
        
        if (!dayData) return null;

        const getStatusClass = () => {
             switch (dayData.status) {
                case 'Present': return 'bg-green-100 border border-green-200 text-green-800';
                case 'Leave': return 'bg-blue-100 border border-blue-200 text-blue-800';
                case 'Week Off': return 'bg-red-100 border border-red-200 text-red-800';
                case 'Holiday': return 'bg-purple-100 border border-purple-200 text-purple-800';
                case 'Absent': return 'bg-yellow-100 border border-yellow-200 text-yellow-800';
                default: return '';
            }
        }

        if (dayData.status === 'Present') {
             return (
                <div className={`absolute bottom-2 left-2 right-2 ${getStatusClass()} rounded-md p-1 text-xs text-left`}>
                    <p>{dayData.checkIn} - {dayData.checkOut}</p>
                    <p className="font-semibold">Total: {dayData.totalHours}</p>
                </div>
            )
        }
        
        return (
            <div className={`absolute bottom-2 left-2 right-2 ${getStatusClass()} rounded-md p-1 text-xs font-semibold text-center`}>
                {dayData.status}
            </div>
        )
    };

    const dayHasData = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return !!detailedAttendanceLog[dateKey];
    }
    
    return (
        <div className="space-y-6">
             <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                    <p className="text-gray-500">Track your work hours and attendance.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input className="w-full sm:w-64 pl-10" placeholder="Search..." type="text"/>
                    </div>
                    <Button className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                        <Plus className="mr-2 h-4 w-4" />
                        Attendance Regularization
                    </Button>
                </div>
            </header>

            <Card className="shadow-md">
                <CardHeader>
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>
                            <ChevronLeft className="h-5 w-5"/>
                        </Button>
                         <h2 className="text-xl font-semibold text-gray-700">{format(month, 'MMMM yyyy')}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>
                            <ChevronRight className="h-5 w-5"/>
                        </Button>
                     </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>Present</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>Absent</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>Week off</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>Leave</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>Holiday</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>Office</div>
                    </div>
                   </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                     <Calendar
                        month={month}
                        onMonthChange={setMonth}
                        components={{
                            DayContent: DayCellContent,
                        }}
                        className="detailed-calendar"
                        classNames={{
                           cell: cn("relative h-24 sm:h-32 text-left align-top p-2"),
                           day: cn("absolute top-2 left-2"),
                           day_today: "bg-transparent font-bold text-indigo-600",
                           day_disabled: "text-gray-400",
                           day_outside: "text-gray-400",
                           row: 'divide-x divide-gray-200',
                           table: 'w-full border-t border-l border-gray-200',
                           head_cell: 'py-3 bg-gray-50 font-semibold text-gray-600 text-sm',
                        }}
                         modifiers={{
                            weekOff: date => {
                                const dayInfo = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
                                return dayInfo?.status === 'Week Off';
                            }
                        }}
                        modifiersClassNames={{
                            weekOff: 'bg-red-50'
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
