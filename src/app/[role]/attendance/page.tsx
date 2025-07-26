
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Mock attendance data
const detailedAttendanceLog: Record<
  string,
  {
    status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday';
    checkIn?: string;
    checkOut?: string;
    totalHours?: string;
    location: 'Office' | 'Home';
  }
> = Array.from({ length: 31 }, (_, i) => i + 1).reduce((acc, day) => {
    const date = new Date(2025, 6, day); // July 2025
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekends
        acc[dateKey] = { status: 'Week Off', location: 'Office' };
    } else if (day === 15) {
        acc[dateKey] = { status: 'Holiday', location: 'Office' };
    } else if (day === 10) {
        acc[dateKey] = { status: 'Leave', location: 'Office' };
    } else if (day === 18) {
        acc[dateKey] = { status: 'Absent', location: 'Office' };
    } else if (day > 5 && day < 28) {
        acc[dateKey] = {
            status: 'Present',
            checkIn: '09:01',
            checkOut: '18:05',
            totalHours: '9h 4m',
            location: 'Office',
        };
    }
    return acc;
}, {} as Record<string, { status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday'; checkIn?: string; checkOut?: string; totalHours?: string; location: 'Office' | 'Home';}>);

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

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // Set to July 2025 for demo
  const { toast } = useToast();

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
    <div className="space-y-6">
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
                <div key={day.toString()} className={cn("relative p-2 h-24 sm:h-32", getDayBgClass(day))}>
                    <span className={cn("text-sm", format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-primary text-primary-foreground rounded-full flex items-center justify-center h-6 w-6' : '')}>
                        {format(day, 'd')}
                    </span>
                    <DayCellContent date={day} />
                </div>
             ))}
        </div>
      </div>
    </div>
  );
}
