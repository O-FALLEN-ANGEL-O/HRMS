
'use client';

import { useState } from 'react';
import { format, getDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown, Clock, Briefcase, Award, Ticket, Building, User, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

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

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date); // Sunday is 0, Saturday is 6

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            log[dateKey] = { status: 'Week Off', location: 'Office' };
        } else if (day === 15) { 
            log[dateKey] = { status: 'Holiday', location: 'Office', shiftDetails: 'General Holiday' };
        } else if (day === 10) { 
            log[dateKey] = { status: 'Leave', location: 'Office', shiftDetails: 'Sick Leave' };
        } else if (day === 18) { 
            log[dateKey] = { status: 'Absent', location: 'Office', shiftDetails: '[TESMNG(ITESMNG)], 09:00 - 18:00' };
        } else { 
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


function RegularizationDialog() {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Regularization Submitted",
            description: "Your request has been sent to your manager for approval.",
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="flex items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition">
                    <Plus className="mr-2 h-4 w-4"/>
                    Attendance Regularization
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attendance Regularization</DialogTitle>
                    <DialogDescription>
                        Request a correction for a past date if you forgot to check in/out or were marked absent incorrectly.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Request Type</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select request type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="missed-check-in">Missed Check-in/out</SelectItem>
                                    <SelectItem value="wrongly-marked-absent">Wrongly Marked Absent</SelectItem>
                                    <SelectItem value="permission">Permission/On-Duty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea id="reason" name="reason" placeholder="Please explain the reason for this request..." required/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function AttendanceDetailPanel({ date, onClose }: { date: Date, onClose: () => void }) {
    const detailedAttendanceLog = generateAttendanceLog(date.getFullYear(), date.getMonth());
    const dayData = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
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
        <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl p-6 flex flex-col z-20 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center space-x-2">
                    <Input className="p-1 border rounded-md" type="date" value={format(date, 'yyyy-MM-dd')}/>
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
                                <div className="pl-4 border-l-2 border-gray-300 space-y-6 relative">
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
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // Set to July 2025 for demo
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const detailedAttendanceLog = generateAttendanceLog(currentDate.getFullYear(), currentDate.getMonth());

  const DayCellContent = ({ date }: { date: Date }) => {
    if (!date || !date.getDate()) return null;

    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = detailedAttendanceLog[dateKey];
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
                    <p>{dayData.checkIn} - {dayData.checkOut}</p>
                    <p className="font-semibold">Total: {dayData.totalHours}</p>
                </>
            ) : (
                <p className="font-semibold text-center">{dayData.status}</p>
            )}
        </div>
      );
    }
    return null;
  };
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
  
  const firstDayOfMonth = startOfMonth.getDay();

  const getDayBgClass = (date: Date) => {
    const dayInfo = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
    if (!dayInfo) return 'bg-card';
    switch (dayInfo.status) {
        case 'Present': return 'bg-green-50 dark:bg-green-900/20';
        case 'Week Off': return 'bg-red-50 dark:bg-red-900/20';
        case 'Holiday': return 'bg-purple-50 dark:bg-purple-900/20';
        case 'Leave': return 'bg-blue-50 dark:bg-blue-900/20';
        case 'Absent': return 'bg-yellow-50 dark:bg-yellow-900/20';
        default: return 'bg-card';
    }
  }


  return (
    <div className="space-y-6 relative overflow-hidden">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Attendance</h1>
                <p className="text-muted-foreground">Track your work hours and request corrections.</p>
            </div>
            <div className="flex items-center space-x-2">
                <RegularizationDialog />
            </div>
        </header>

      <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" className="p-2 rounded-full hover:bg-muted" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                <Button variant="ghost" className="p-2 rounded-full hover:bg-muted" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
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
      {selectedDate && <AttendanceDetailPanel date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
