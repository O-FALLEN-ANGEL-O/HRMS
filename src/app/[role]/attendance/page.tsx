
'use client';

import { useState } from 'react';
import { format, getMonth, getYear, setMonth, setYear, subDays, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // Set to July 2025 for demo

  const DayCellContent = ({ date }: { date: Date }) => {
    if (!isValid(date)) return null;

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

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  
  const firstDayOfMonth = startOfMonth(currentDate).getDay();

  const getDayBgClass = (date: Date) => {
    const dayInfo = detailedAttendanceLog[format(date, 'yyyy-MM-dd')];
    if (!dayInfo) return 'bg-white';
    switch (dayInfo.status) {
        case 'Present': return 'bg-green-50';
        case 'Week Off': return 'bg-red-50';
        case 'Holiday': return 'bg-purple-50';
        case 'Leave': return 'bg-blue-50';
        case 'Absent': return 'bg-yellow-50';
        default: return 'bg-white';
    }
  }


  return (
    <div className="space-y-6">
       <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                <p className="text-gray-500">Track your work hours and attendance.</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search..." type="text"/>
                </div>
                <Button className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                    <Plus className="mr-2 h-4 w-4"/>
                    Attendance Regularization
                </Button>
            </div>
        </header>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <h2 className="text-xl font-semibold text-gray-700">{format(currentDate, 'MMMM yyyy')}</h2>
                <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>
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

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
             {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center py-3 bg-gray-100 font-semibold text-gray-600 text-sm">{day}</div>
             ))}

             {/* Blank cells for days before start of month */}
             {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} className="bg-white p-3 h-32"></div>
             ))}

             {/* Month day cells */}
             {daysInMonth.map(day => (
                <div key={day.toString()} className={cn("relative p-3 h-32 text-gray-900", getDayBgClass(day))}>
                    <span className={cn(isSameDay(day, new Date()) ? 'text-indigo-600 font-bold' : '')}>{format(day, 'd')}</span>
                    <DayCellContent date={day} />
                </div>
             ))}
        </div>
      </div>
    </div>
  );
}
