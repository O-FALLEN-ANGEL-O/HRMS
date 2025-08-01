
'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, getDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, X, Loader2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaceVerificationDialog } from '@/components/attendance/face-verification-dialog';
import { Skeleton } from '@/components/ui/skeleton';


// Function to generate mock attendance data for a given month and year
const generateAttendanceLog = (year: number, month: number) => {
    const log: Record<string, {
        status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday';
        checkIn?: string;
        checkOut?: string;
        totalHours?: string;
        shiftDetails?: string;
        location: 'Office' | 'Home';
    }> = {};

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date); // Sunday is 0, Saturday is 6

        // Don't generate data for future days in the current month
        if (isCurrentMonth && day > today.getDate()) {
            continue;
        }

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            log[dateKey] = { status: 'Week Off', location: 'Office', shiftDetails: 'Weekend' };
        } else if (day === 15) { 
            log[dateKey] = { status: 'Holiday', location: 'Office', shiftDetails: 'General Holiday' };
        } else if (day === 10) { 
            log[dateKey] = { status: 'Leave', location: 'Office', shiftDetails: 'Sick Leave' };
        } else if (day === 18) { 
            log[dateKey] = { status: 'Absent', location: 'Office', shiftDetails: '[TESMNG(ITESMNG)], 09:00 - 18:00' };
        } else if (isCurrentMonth && day === today.getDate()) {
            // Leave today blank to be filled by clock-in/out
            continue;
        }
        else { 
             log[dateKey] = {
                status: 'Present',
                checkIn: '09:12',
                checkOut: '19:00',
                totalHours: '9h 48m',
                shiftDetails: '[TESMNG(ITESMNG)], 09:00 - 18:00',
                location: 'Office',
            };
        }
    }
    return log;
};


function AttendanceDetailPanel({ date, onClose, dayData }: { date: Date, onClose: () => void, dayData: any }) {
    if (!dayData) return null;

    const getStatusBadge = () => {
        switch(dayData.status) {
            case 'Present': return <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{dayData.status}</span>;
            case 'Absent': return <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{dayData.status}</span>;
            case 'Leave': return <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{dayData.status}</span>;
            case 'Week Off': return <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">{dayData.status}</span>;
            case 'Holiday': return <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{dayData.status}</span>;
            default: return null;
        }
    };

    return (
        <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl p-6 flex flex-col z-20 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center space-x-2">
                    <Input className="p-1 border rounded-md" type="date" defaultValue={format(date, 'yyyy-MM-dd')}/>
                </div>
                <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-muted" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {format(date, 'MMM dd, yyyy')} {getStatusBadge()}
                            </h3>
                            {dayData.status === 'Present' && <p className="text-sm text-muted-foreground">Working hours: {dayData.totalHours}</p>}
                            <p className="text-sm text-muted-foreground">Shift Details: {dayData.shiftDetails}</p>
                        </div>
                    </div>
                    {dayData.status === 'Present' && (
                        <>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">In-Time</p>
                                    <p className="font-semibold">{dayData.checkIn} <span className="text-xs text-blue-500 bg-blue-100 px-1 py-0.5 rounded">Biometric</span></p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Out-Time</p>
                                    <p className="font-semibold">{dayData.checkOut} <span className="text-xs text-blue-500 bg-blue-100 px-1 py-0.5 rounded">Biometric</span></p>
                                </div>
                                <div><p className="text-muted-foreground">Deduction</p><p className="font-semibold">00:00</p></div>
                                <div><p className="text-muted-foreground">Comp-off</p><p className="font-semibold">0</p></div>
                                <div><p className="text-muted-foreground">Overtime</p><p className="font-semibold">01:00</p></div>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-semibold mb-4">Clocking times</h4>
                                <div className="pl-4 border-l-2 border-primary space-y-6 relative">
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 bg-background border-2 border-primary rounded-full z-10"></div>
                                        <p className="text-sm font-semibold">{dayData.checkIn} <span className="text-xs text-blue-500 bg-blue-100 px-1 py-0.5 rounded">Biometric</span></p>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 bg-background border-2 border-primary rounded-full z-10"></div>
                                        <p className="text-sm font-semibold">{dayData.checkOut} <span className="text-xs text-blue-500 bg-blue-100 px-1 py-0.5 rounded">Biometric</span></p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                 <Accordion type="multiple" className="w-full">
                    <AccordionItem value="shift">
                        <AccordionTrigger className="font-semibold">Shift</AccordionTrigger>
                        <AccordionContent>Shift details will appear here.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="expense">
                        <AccordionTrigger className="font-semibold">Expense</AccordionTrigger>
                        <AccordionContent>Expense details will appear here.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="badges">
                        <AccordionTrigger className="font-semibold">Badges</AccordionTrigger>
                        <AccordionContent>Badges earned on this day will appear here.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </aside>
    );
}

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const params = useParams();
  const router = useRouter();
  const role = params.role as string;
  
  const [attendanceLog, setAttendanceLog] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setAttendanceLog(generateAttendanceLog(now.getFullYear(), now.getMonth()));
  }, []);

  const handleClockInOut = () => {
    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');
    const currentTime = format(today, 'HH:mm');
    
    setAttendanceLog(prevLog => {
        if (!prevLog) return null;
        const newLog = { ...prevLog };
        const todayEntry = newLog[todayKey];

        if (todayEntry && todayEntry.status === 'Present') {
            const checkInTime = todayEntry.checkIn ? new Date(`${todayKey}T${todayEntry.checkIn}`) : new Date();
            const checkOutTime = new Date(`${todayKey}T${currentTime}`);
            const diffMs = checkOutTime.getTime() - checkInTime.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            newLog[todayKey] = {
                ...todayEntry,
                checkOut: currentTime,
                totalHours: `${diffHours}h ${diffMins}m`
            };
        } else {
            newLog[todayKey] = {
                status: 'Present',
                checkIn: currentTime,
                shiftDetails: '[TESMNG(ITESMNG)], 09:00 - 18:00',
                location: 'Office'
            };
        }
        return newLog;
    });
  };

  const DayCellContent = ({ date }: { date: Date }) => {
    if (!date || !date.getDate() || !attendanceLog) return null;

    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = attendanceLog[dateKey];
    if (!dayData) return null;
    
    if (dayData.status === 'Present' || dayData.status === 'Week Off' || dayData.status === 'Holiday' || dayData.status === 'Leave' || dayData.status === 'Absent') {
      const getStatusClass = () => {
        switch (dayData.status) {
          case 'Present': return 'bg-green-100 border-green-200 text-green-800';
          case 'Leave': return 'bg-blue-100 border-blue-200 text-blue-800';
          case 'Week Off': return 'bg-red-100 border-red-200 text-red-800';
          case 'Holiday': return 'bg-purple-100 border-purple-200 text-purple-800';
          case 'Absent': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
          default: return '';
        }
      };

      return (
        <div className={cn("absolute bottom-2 left-2 right-2 rounded-md p-1 text-xs border", getStatusClass())}>
            {dayData.status === 'Present' ? (
                <>
                    <p>{dayData.checkIn} - {dayData.checkOut || '...'}</p>
                    <p className="font-semibold">Total: {dayData.totalHours || '...'}</p>
                </>
            ) : (
                <p className="font-semibold text-center">{dayData.status}</p>
            )}
        </div>
      );
    }
    return null;
  };
  
  if (!currentDate || !attendanceLog) {
     return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-[600px] w-full" />
        </div>
     );
  }

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = Array.from({ length: end.getDate() }, (_, i) => new Date(start.getFullYear(), start.getMonth(), i + 1));
  const firstDayOfMonth = start.getDay();

  const getDayBgClass = (date: Date, prefix: string = 'bg-') => {
    const dayInfo = attendanceLog[format(date, 'yyyy-MM-dd')];
    if (!dayInfo) return `${prefix}card dark:${prefix}card`;
    switch (dayInfo.status) {
        case 'Present': return `${prefix}green-50 dark:${prefix}green-900/20`;
        case 'Week Off': return `${prefix}red-50 dark:${prefix}red-900/20`;
        case 'Holiday': return `${prefix}purple-50 dark:${prefix}purple-900/20`;
        case 'Leave': return `${prefix}blue-50 dark:${prefix}blue-900/20`;
        case 'Absent': return `${prefix}yellow-50 dark:${prefix}yellow-900/20`;
        default: return `${prefix}card dark:${prefix}card`;
    }
  }


  return (
    <div className="relative overflow-hidden h-full">
        {/* Mobile View */}
        <div className="md:hidden p-4">
            <header className="flex justify-between items-center mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft /></Button>
                <h1 className="text-xl font-bold">My Attendance</h1>
                <Button variant="ghost" size="icon"><MoreVertical /></Button>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                 <FaceVerificationDialog onVerificationSuccess={handleClockInOut} />
                 <Button asChild>
                    <Link href={`/${role}/attendance/regularize`}>
                         <Plus className="mr-2 h-4 w-4"/>
                        Correction
                    </Link>
                </Button>
            </div>
            
            <div className="bg-card p-4 rounded-2xl shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft />
                    </Button>
                    <h2 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight />
                    </Button>
                </div>

                <div className="grid grid-cols-5 gap-2 text-xs text-center text-muted-foreground mb-4">
                    <div className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-200"></span>Present</div>
                    <div className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-200"></span>Absent</div>
                    <div className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-200"></span>Week off</div>
                    <div className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>Leave</div>
                    <div className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-200"></span>Holiday</div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2 text-sm">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`blank-${i}`}></div>)}
                    {daysInMonth.map(day => (
                        <div key={day.toString()} className={cn("text-center p-1 rounded-lg", getDayBgClass(day))} onClick={() => setSelectedDate(day)}>
                           <div className={cn('font-bold', isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : '')}>
                             {format(day, 'd')}
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">My Attendance</h1>
                        <p className="text-muted-foreground">Track your work hours and request corrections.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaceVerificationDialog onVerificationSuccess={handleClockInOut} />
                        <Button asChild>
                            <Link href={`/${role}/attendance/regularize`}>
                                <Plus className="mr-2 h-4 w-4"/>
                                Attendance Regularization
                            </Link>
                        </Button>
                    </div>
                </header>

            <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" className="p-2 rounded-full hover:bg-muted" onClick={() => setCurrentDate(prev => new Date(prev!.getFullYear(), prev!.getMonth() - 1, 1))}>
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                        <Button variant="ghost" className="p-2 rounded-full hover:bg-muted" onClick={() => setCurrentDate(prev => new Date(prev!.getFullYear(), prev!.getMonth() + 1, 1))}>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div><span>Present</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></div><span>Absent</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div><span>Week off</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></div><span>Leave</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></div><span>Holiday</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center py-2 bg-muted/50 font-semibold text-muted-foreground text-xs">{day}</div>
                    ))}

                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`blank-${i}`} className="bg-card p-2 h-24 sm:h-32"></div>
                    ))}

                    {daysInMonth.map(day => (
                        <div key={day.toString()} className={cn("relative p-2 h-24 sm:h-32 cursor-pointer transition-colors hover:bg-accent", getDayBgClass(day))} onClick={() => setSelectedDate(day)}>
                            <span className={cn("text-sm", format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-primary text-primary-foreground rounded-full flex items-center justify-center h-6 w-6' : '')}>
                                {format(day, 'd')}
                            </span>
                            <DayCellContent date={day} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {selectedDate && <AttendanceDetailPanel date={selectedDate} onClose={() => setSelectedDate(null)} dayData={attendanceLog[format(selectedDate, 'yyyy-MM-dd')]}/>}
    </div>
  );
}
