
'use client';

import { useState } from 'react';
import { format, getMonth, getYear, setMonth, setYear, isValid, subDays } from 'date-fns';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
> = {
  [format(subDays(new Date(), 0), 'yyyy-MM-dd')]: {
    status: 'Present',
    checkIn: '09:01',
    checkOut: '18:05',
    totalHours: '9h 4m',
    location: 'Office',
  },
  [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: {
    status: 'Present',
    checkIn: '08:58',
    checkOut: '17:59',
    totalHours: '9h 1m',
    location: 'Office',
  },
  [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: {
    status: 'Present',
    checkIn: '09:05',
    checkOut: '18:00',
    totalHours: '8h 55m',
    location: 'Home',
  },
  [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: {
    status: 'Holiday',
    location: 'Office',
  },
  [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: {
    status: 'Present',
    checkIn: '09:10',
    checkOut: '18:15',
    totalHours: '9h 5m',
    location: 'Home',
  },
  [format(subDays(new Date(), 5), 'yyyy-MM-dd')]: {
    status: 'Leave',
    location: 'Office',
  },
  [format(subDays(new Date(), 6), 'yyyy-MM-dd')]: {
    status: 'Week Off',
    location: 'Office',
  },
  [format(subDays(new Date(), 7), 'yyyy-MM-dd')]: {
    status: 'Week Off',
    location: 'Office',
  },
  [format(subDays(new Date(), 10), 'yyyy-MM-dd')]: {
    status: 'Absent',
    location: 'Office',
  },
};

export default function AttendancePage() {
  const params = useParams();
  const role = params.role as string;

  const [currentDate, setCurrentDate] = useState(new Date());

  const DayCellContent = ({ date }: { date: Date }) => {
    try {
      if (!isValid(date)) return null;

      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = detailedAttendanceLog[dateKey];
      if (!dayData) return null;

      const getStatusClass = () => {
        switch (dayData.status) {
          case 'Present': return 'bg-green-100 text-green-800 border-green-200';
          case 'Leave': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Week Off': return 'bg-red-100 text-red-800 border-red-200';
          case 'Holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'Absent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-gray-100';
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
    } catch (error) {
        console.error("Error formatting date in DayCellContent", error);
        return null; // Return null on error to prevent crashing
    }
  };

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
            <Button>
                <Plus className="mr-2 h-4 w-4"/>
                Attendance Regularization
            </Button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <h2 className="text-xl font-semibold text-gray-700">{format(currentDate, 'MMMM yyyy')}</h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </Button>
            </div>
            <div className="hidden md:flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div><span>Present</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div><span>Absent</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div><span>Week off</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div><span>Leave</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div><span>Holiday</span></div>
            </div>
        </div>

        <div className="grid grid-cols-7">
            <Calendar
                month={currentDate}
                onMonthChange={setCurrentDate}
                components={{
                    DayContent: DayCellContent,
                }}
                className="detailed-calendar"
                classNames={{
                    table: 'w-full',
                    head_row: "grid grid-cols-7",
                    head_cell: "text-center py-3 bg-gray-100 font-semibold text-gray-600 text-sm",
                    row: "grid grid-cols-7",
                    cell: "bg-white p-3 h-32 text-gray-900",
                    day: "text-gray-900",
                    day_today: "text-indigo-600 font-bold",
                    day_disabled: "text-gray-400",
                    day_outside: "text-gray-400 bg-gray-50",
                }}
                modifiers={{
                    weekOff: date => {
                        const dayInfo = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
                        return dayInfo?.status === 'Week Off';
                    },
                    holiday: date => {
                        const dayInfo = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
                        return dayInfo?.status === 'Holiday';
                    }
                }}
                modifiersClassNames={{
                    weekOff: '!bg-red-50 text-red-700',
                    holiday: '!bg-purple-50 text-purple-700'
                }}
            />
        </div>
      </div>
    </div>
  );
}
