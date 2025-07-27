
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Mail, Phone, Building, Briefcase, User, Heart, MessageSquare, Trash2, ChevronRight, MoreHorizontal, ChevronLeft, Download, ExpandMore, ExpandLess, CalendarDays } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type EmployeeProfile = typeof mockEmployees[0];

const ActivityCalendar = () => {
    const { toast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date(2023, 8, 1)); // September 2023

    const generateMonthData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const dates = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            dates.push({ day: null, status: 'empty' });
        }

        const statuses = ['present', 'present', 'present', 'absent', 'present', 'leave', 'half-day', 'day-off'];

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const status = (date.getDay() === 0 || date.getDay() === 6) ? 'day-off' : randomStatus;
            
            dates.push({
                day: i,
                fullDate: date,
                status: status,
                checkIn: status === 'present' || status === 'half-day' ? '09:00 AM' : undefined,
                checkOut: status === 'present' ? '06:00 PM' : undefined
            });
        }
        return dates;
    };
    
    const monthData = useMemo(generateMonthData, [currentMonth]);
    
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'present': return 'bg-green-500';
            case 'absent': return 'bg-red-500';
            case 'leave': return 'bg-yellow-400';
            case 'half-day': return 'bg-gradient-to-r from-green-500 to-red-500';
            case 'day-off':
            default: return 'bg-gray-200';
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">Activity</h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            <ExpandMore className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({title: "Download action triggered"})}>
                            <Download className="mr-2 h-4 w-4"/>Report
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 gap-2">
                    {monthData.map((item, index) => (
                        <TooltipProvider key={index}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="p-1 text-right relative group">
                                        <span className={`text-sm ${!item.day ? 'text-gray-400' : ''}`}>
                                            {item.day || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1).getDate()}
                                        </span>
                                        {item.day && <div className={`w-full h-1.5 ${getStatusColor(item.status)} rounded-full mt-1`}></div>}
                                    </div>
                                </TooltipTrigger>
                                {item.day && (
                                    <TooltipContent>
                                        <p className="font-bold">{item.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p>Status: <span className="capitalize">{item.status.replace('-', ' ')}</span></p>
                                        {item.checkIn && <p>Check-in: {item.checkIn}</p>}
                                        {item.checkOut && <p>Check-out: {item.checkOut}</p>}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
                <div className="flex items-center justify-end flex-wrap space-x-4 mt-6 text-xs text-gray-600">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Present</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Absent</span></div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full relative overflow-hidden"><div className="absolute inset-0 w-1/2 bg-green-500"></div><div className="absolute inset-0 w-1/2 bg-red-500 ml-[50%]"></div></div>
                        <span>Half Day</span>
                    </div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span>Applied Leave</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div><span>Day Off</span></div>
                </div>
            </CardContent>
        </Card>
    )
}


const ConnectionCard = ({ title, items }: { title: string, count?: number, items: {label: string, count?: number}[] }) => (
    <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
        <div className="space-y-3">
            {items.map(item => (
                <button key={item.label} className="w-full flex justify-between items-center bg-gray-100 dark:bg-muted p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-muted/80">
                    <span className="flex items-center">
                        {item.count && <span className="bg-white dark:bg-card border rounded-md px-1.5 py-0.5 mr-2 text-xs">{item.count}</span>}
                        {item.label}
                    </span>
                    <Plus className="h-4 w-4 text-gray-500"/>
                </button>
            ))}
        </div>
    </div>
);


function ConnectionsTab() {
    const { user } = useAuth();
    const attendanceItems = [ { label: '99+ Attendance' }, { label: 'Attendance Request'}, { label: 'Employee Checkin'}];
    const leaveItems = [ { label: 'Leave Application', count: 3}, { label: 'Leave Allocation', count: 2}, { label: 'Leave Policy Assignment'}];
    const lifecycleItems = [ { label: 'Employee Onboarding'}, { label: 'Employee Transfer'}, { label: 'Employee Promotion'}, { label: 'Employee Grievance', count: 1}];
    const exitItems = [ { label: 'Employee Separation' }];
    const shiftItems = [ { label: 'Shift Request' }];
    const expenseItems = [ { label: 'Expense Claim' }];

    const managementRoles = ['admin', 'hr', 'manager', 'team-leader', 'qa-analyst'];
    const showActivityCalendar = user && managementRoles.includes(user.role);
    
    return (
        <div className="space-y-6">
            {showActivityCalendar && <ActivityCalendar />}
            <Card>
                 <CardHeader>
                    <CardTitle className="text-lg font-semibold">Connections</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ConnectionCard title="Attendance" items={attendanceItems} />
                    <ConnectionCard title="Leave" items={leaveItems} />
                    <ConnectionCard title="Lifecycle" items={lifecycleItems} />
                    <ConnectionCard title="Exit" items={exitItems} />
                    <ConnectionCard title="Shift" items={shiftItems} />
                    <ConnectionCard title="Expense" items={expenseItems} />
                </CardContent>
            </Card>
        </div>
    )
}

function AboutTab({ employee }: { employee: EmployeeProfile }) {
    const { toast } = useToast();
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});

    return (
        <Card>
            <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Personal and professional details for {employee.full_name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Detailed 'About' tab content would go here.</p>
            </CardContent>
        </Card>
    )
}

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const employeeId = params.employeeId as string;

    useEffect(() => {
        const foundEmployee = mockEmployees.find(e => e.employee_id === employeeId);
        setEmployee(foundEmployee || null);
        setLoading(false);
    }, [employeeId]);
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!employee) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employee Not Found</CardTitle>
                    <CardDescription>The employee with ID "{employeeId}" could not be found.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0">
                <div className="flex items-center justify-between">
                     <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">Employee</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                        <span className="text-foreground font-medium">{employee.employee_id}</span>
                     </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">Edit</Button>
                        <Button>Save</Button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden mt-6">
                <aside className="w-80 bg-card border-r p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-6">
                             <h1 className="text-xl font-bold text-foreground">{employee.full_name}</h1>
                             <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className="ml-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">{employee.status}</Badge>
                        </div>
                        <div className="flex justify-center mb-6">
                             <Avatar className="w-40 h-40">
                                <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                                <AvatarFallback className="text-4xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                        <nav className="space-y-2">
                            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground"><span>Assigned To</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground"><span>Attachments</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <div className="flex items-center justify-between bg-muted rounded-md p-2 text-sm">
                                <span className="text-foreground">adam7bc121.jpeg</span>
                                <button className="text-muted-foreground hover:text-foreground">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground"><span>Reviews</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground"><span>Tags</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground"><span>Share</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                        </nav>
                         <div className="mt-6 flex items-center space-x-4 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4"/>
                                <span>0</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4"/>
                                <span>0</span>
                            </div>
                        </div>
                    </div>
                     <div className="text-xs text-muted-foreground space-y-1">
                        <p>You last edited this · 22 minutes ago</p>
                        <p>You created this · 1 year ago</p>
                    </div>
                </aside>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-card border-b px-6 py-2 flex justify-between items-center">
                        <Tabs defaultValue="connections" className="w-full">
                            <TabsList>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="connections">Connections</TabsTrigger>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="joining">Joining</TabsTrigger>
                                <TabsTrigger value="address">Address & Contacts</TabsTrigger>
                                <TabsTrigger value="attendance">Attendance & Leaves</TabsTrigger>
                                <TabsTrigger value="salary">Salary</TabsTrigger>
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="exit">Exit</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
                        <Tabs defaultValue="connections" className="w-full">
                            <TabsContent value="about">
                                <AboutTab employee={employee} />
                            </TabsContent>
                            <TabsContent value="connections">
                                <ConnectionsTab />
                            </TabsContent>
                            <TabsContent value="overview"><Card><CardContent className="p-4">Overview Content</CardContent></Card></TabsContent>
                            <TabsContent value="joining"><Card><CardContent className="p-4">Joining Content</CardContent></Card></TabsContent>
                            <TabsContent value="address"><Card><CardContent className="p-4">Address & Contacts Content</CardContent></Card></TabsContent>
                            <TabsContent value="attendance"><Card><CardContent className="p-4">Attendance & Leaves Content</CardContent></Card></TabsContent>
                            <TabsContent value="salary"><Card><CardContent className="p-4">Salary Content</CardContent></Card></TabsContent>
                            <TabsContent value="personal"><Card><CardContent className="p-4">Personal Content</CardContent></Card></TabsContent>
                            <TabsContent value="profile"><Card><CardContent className="p-4">Profile Content</CardContent></Card></TabsContent>
                            <TabsContent value="exit"><Card><CardContent className="p-4">Exit Content</CardContent></Card></TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
