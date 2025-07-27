
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns';
import { shifts, teamForShiftRoster, type Shift } from '@/lib/mock-data/shifts';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Roster = Record<string, Record<string, string | null>>; // { [employeeId]: { [dateString]: shiftId } }

export default function ShiftPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roster, setRoster] = useState<Roster>({});
  const { toast } = useToast();
  
  const monthInterval = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handleShiftAssign = (employeeId: string, date: Date, shiftId: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setRoster(prevRoster => ({
        ...prevRoster,
        [employeeId]: {
            ...prevRoster[employeeId],
            [dateString]: shiftId,
        }
    }));
    toast({ title: "Shift Assigned!", description: "The employee's roster has been updated." });
  };

  const getShiftFromId = (shiftId: string | null): Shift | undefined => {
    return shifts.find(s => s.id === shiftId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Shift & Roster Management</h1>
        <p className="text-muted-foreground">Create and manage daily and weekly employee rosters.</p>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                     <h2 className="text-xl font-semibold text-center w-40">{format(currentDate, 'MMMM yyyy')}</h2>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Shift Type</Button>
                    <Button>Publish Roster</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="sticky left-0 bg-muted p-2 text-left text-sm font-semibold border w-48">Employee</th>
                            {monthInterval.map(day => {
                                const dayOfWeek = getDay(day);
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                return (
                                    <th key={day.toString()} className={cn("p-2 text-center text-sm font-semibold border", isWeekend && "bg-muted/50")}>
                                        <div className="flex flex-col items-center">
                                            <span>{format(day, 'E')}</span>
                                            <span className="text-lg">{format(day, 'd')}</span>
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {teamForShiftRoster.map(employee => (
                            <tr key={employee.employee_id}>
                                <td className="sticky left-0 bg-background p-2 text-left text-sm font-medium border w-48">
                                    {employee.full_name}
                                </td>
                                {monthInterval.map(day => {
                                    const assignedShiftId = roster[employee.employee_id]?.[format(day, 'yyyy-MM-dd')];
                                    const assignedShift = getShiftFromId(assignedShiftId || null);
                                    const dayOfWeek = getDay(day);
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    if (isWeekend) {
                                        return (
                                            <td key={day.toString()} className="p-2 border bg-muted/30 text-center">
                                                 <Badge variant="outline">WO</Badge>
                                            </td>
                                        )
                                    }

                                    return (
                                         <td key={day.toString()} className="p-2 border text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant={assignedShift ? "secondary" : "ghost"} size="sm" className="w-full h-12">
                                                        {assignedShift ? (
                                                            <div className="text-xs text-left w-full">
                                                                <p className="font-bold">{assignedShift.name}</p>
                                                                <p>{assignedShift.start_time} - {assignedShift.end_time}</p>
                                                            </div>
                                                        ) : <PlusCircle className="h-4 w-4 text-muted-foreground"/>}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {shifts.map(shift => (
                                                         <DropdownMenuItem key={shift.id} onClick={() => handleShiftAssign(employee.employee_id, day, shift.id)}>
                                                            {shift.name} ({shift.start_time} - {shift.end_time})
                                                        </DropdownMenuItem>
                                                    ))}
                                                     {assignedShift && <DropdownMenuItem className="text-destructive" onClick={() => handleShiftAssign(employee.employee_id, day, '')}>Clear</DropdownMenuItem>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
