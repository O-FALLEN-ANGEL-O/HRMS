
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Badge } from "@/components/ui/badge";

// Mock data representing team leave for a month
const teamLeaveData = [
  { name: 'Ravi K.', 'Sick Leave': 2, 'Casual Leave': 0, 'PTO': 0 },
  { name: 'Sunita S.', 'Sick Leave': 0, 'Casual Leave': 1, 'PTO': 0 },
  { name: 'John D.', 'Sick Leave': 0, 'Casual Leave': 0, 'PTO': 7 },
  { name: 'Michael J.', 'Sick Leave': 1, 'Casual Leave': 0, 'PTO': 0 },
  { name: 'Anika S.', 'Sick Leave': 0, 'Casual Leave': 2, 'PTO': 5 },
  { name: 'Rohan V.', 'Sick Leave': 1, 'Casual Leave': 1, 'PTO': 0 },
];

// Mock data for a "Who's Out Today" view
const whosOutToday = [
    { name: 'Priya Mehta', leaveType: 'Work From Home' },
    { name: 'John Doe', leaveType: 'PTO' },
];

const holidays = [
    { date: '2024-11-28', name: 'Thanksgiving Day' },
    { date: '2024-12-25', name: 'Christmas Day' },
]

export default function LeaveCalendarPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline tracking-tight">Team Leave Calendar</h1>
            <p className="text-muted-foreground">Visualize your team's planned absences to manage resources effectively.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Leave Overview</CardTitle>
          <CardDescription>Total days of leave taken by each team member this month, by leave type.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teamLeaveData}
              layout="vertical"
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80}/>
              <Tooltip 
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="Sick Leave" stackId="a" fill="hsl(var(--destructive))" />
              <Bar dataKey="Casual Leave" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="PTO" stackId="a" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Who's Out Today?</CardTitle>
            </CardHeader>
            <CardContent>
                 {whosOutToday.length > 0 ? (
                    <ul className="space-y-3">
                        {whosOutToday.map((employee, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className='font-medium'>{employee.name}</span>
                               <Badge variant="secondary">{employee.leaveType}</Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Everyone is working today!</p>
                )}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent>
                 {holidays.length > 0 ? (
                    <ul className="space-y-4">
                        {holidays.map((holiday, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className='font-medium'>{holiday.name}</span>
                               <span className='text-muted-foreground'>{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming holidays scheduled.</p>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
