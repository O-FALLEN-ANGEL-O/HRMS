
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Mail, Phone, Building, Briefcase, User, Heart, MessageSquare, Trash2, ChevronRight, MoreHorizontal, ChevronLeft, Download, ChevronDown, ChevronUp, CalendarDays, BookUser, History, Award, Star, Users, HeartPulse, Shield } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { AboutTab } from '@/components/employee-profile/about-tab';
import { ProfessionalTab } from '@/components/employee-profile/professional-tab';
import { FamilyHealthTab } from '@/components/employee-profile/family-health-tab';
import { DocumentsTab } from '@/components/employee-profile/documents-tab';
import type { UserProfile } from '@/lib/mock-data/employees';


const ActivityCalendar = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Mock data for the calendar grid
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
    
    const month = 8; // September
    const year = 2023;
    
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const activityData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        if (day === 12 || day === 27) return { status: 'Absent', checkIn: null, checkOut: null, reason: 'Unplanned Leave' };
        if (day === 19) return { status: 'Leave', checkIn: null, checkOut: null, reason: 'Sick Leave' };
        if (day === 26) return { status: 'Half Day', checkIn: '09:00 AM', checkOut: null, reason: 'Personal Emergency' };
        if (new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6) return { status: 'Day Off', checkIn: null, checkOut: null, reason: null };
        if (day > 28) return { status: 'Upcoming', checkIn: null, checkOut: null, reason: null };
        return { status: 'Present', checkIn: `09:${String(Math.floor(Math.random() * 10)).padStart(2, '0')} AM`, checkOut: `06:${String(Math.floor(Math.random() * 10)).padStart(2, '0')} PM`, reason: null };
    });

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Present': return 'bg-green-500';
            case 'Absent': return 'bg-red-500';
            case 'Leave': return 'bg-yellow-400';
            case 'Day Off': return 'bg-gray-200';
            case 'Half Day': return 'half-day';
            default: return 'bg-gray-100';
        }
    };
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    Activity
                </h2>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <span>September 2023</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Report</span>
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                {weekDays.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {activityData.map((activity, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 text-right relative group">
                                     <span className={`text-sm ${isCurrentMonth && (index + 1) === today.getDate() ? 'font-bold bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                        {index + 1}
                                    </span>
                                    {activity.status === 'Half Day' ? (
                                        <div className="w-full h-1.5 rounded-full mt-1 relative overflow-hidden"><div className="h-full w-1/2 bg-green-500 float-left"></div><div className="h-full w-1/2 bg-red-500 float-right"></div></div>
                                    ) : (
                                        <div className={`w-full h-1.5 ${getStatusColor(activity.status)} rounded-full mt-1`}></div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">Sept {index + 1}, 2023</p>
                                <p>Status: {activity.status}</p>
                                {activity.checkIn && <p>Check-in: {activity.checkIn}</p>}
                                {activity.checkOut && <p>Check-out: {activity.checkOut}</p>}
                                {activity.reason && <p>Reason: {activity.reason}</p>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
             <div className="flex items-center justify-end space-x-4 mt-6 text-xs text-gray-600">
                <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Present</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Absent</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full relative"><div className="absolute inset-0 w-1/2 bg-green-500 rounded-l-full"></div><div className="absolute inset-0 w-1/2 bg-red-500 rounded-r-full ml-[50%]"></div></div><span>Half Day</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span>Applied Leave</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div><span>Day Off</span></div>
            </div>
        </div>
    );
};

const ConnectionsTab = () => {
    return (
        <div className="space-y-6">
            <ActivityCalendar />
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-6">
                    Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Attendance Column */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Attendance</h3>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-between">99+ Attendance <Plus/></Button>
                            <Button variant="outline" className="w-full justify-between">Attendance Request <Plus/></Button>
                            <Button variant="outline" className="w-full justify-between">Employee Checkin <Plus/></Button>
                        </div>
                    </div>
                     {/* Leave Column */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Leave</h3>
                        <div className="space-y-3">
                           <Button variant="outline" className="w-full justify-between">
                             <span className="flex items-center"><Badge variant="secondary" className="mr-2">3</Badge> Leave Application</span>
                             <Plus/>
                           </Button>
                           <Button variant="outline" className="w-full justify-between">
                             <span className="flex items-center"><Badge variant="secondary" className="mr-2">2</Badge> Leave Allocation</span>
                             <Plus/>
                           </Button>
                            <Button variant="outline" className="w-full justify-between">Leave Policy Assignment <Plus/></Button>
                        </div>
                    </div>
                     {/* Lifecycle Column */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Lifecycle</h3>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-between">Employee Onboarding <Plus/></Button>
                            <Button variant="outline" className="w-full justify-between">Employee Transfer <Plus/></Button>
                            <Button variant="outline" className="w-full justify-between">Employee Promotion <Plus/></Button>
                            <Button variant="outline" className="w-full justify-between">
                                <span className="flex items-center"><Badge variant="secondary" className="mr-2">1</Badge> Employee Grievance</span>
                                <Plus/>
                           </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: loggedInUser } = useAuth();
    const [employee, setEmployee] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const employeeId = params.employeeId as string;

    useEffect(() => {
        const foundEmployee = mockEmployees.find(e => e.employee_id === employeeId);
        setEmployee(foundEmployee || null);
        setLoading(false);
    }, [employeeId]);

    const handleSave = () => {
        // In a real app, this would be an API call
        console.log("Saving employee data:", employee);
        useToast().toast({
            title: "Changes Saved",
            description: "Employee data has been updated.",
        });
    };
    
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

    const canViewDetailedProfile = loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'hr' || loggedInUser.role === 'manager' || loggedInUser.role === 'team-leader' || loggedInUser.role === 'qa-analyst');

    // If the user doesn't have permission, you can show a restricted view or redirect.
    // For now, we'll assume the routing logic prevents unauthorized access.
    // This is a placeholder for a more robust permissions system.
    if (!canViewDetailedProfile) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this detailed employee profile.</CardDescription>
                </CardHeader>
            </Card>
        )
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
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden mt-6">
                <aside className="w-80 bg-white border-r p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-6">
                             <h1 className="text-xl font-bold text-gray-800">{employee.full_name}</h1>
                             <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className="ml-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">{employee.status}</Badge>
                        </div>
                        <div className="flex justify-center mb-6">
                             <Avatar className="w-40 h-40 rounded-full">
                                <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                                <AvatarFallback className="text-4xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                        <nav className="space-y-2">
                            <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100"><span>Assigned To</span> <Plus className="h-4 w-4 text-gray-400"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100"><span>Attachments</span> <Plus className="h-4 w-4 text-gray-400"/></Button>
                            <div className="flex items-center justify-between bg-gray-100 rounded-md p-2 text-sm">
                                <span className="text-gray-700">adam7bc121.jpeg</span>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100"><span>Reviews</span> <Plus className="h-4 w-4 text-gray-400"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100"><span>Tags</span> <Plus className="h-4 w-4 text-gray-400"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100"><span>Share</span> <Plus className="h-4 w-4 text-gray-400"/></Button>
                        </nav>
                         <div className="mt-6 flex items-center space-x-4 text-gray-500">
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
                     <div className="text-xs text-gray-400 space-y-1">
                        <p>You last edited this · 22 minutes ago</p>
                        <p>You created this · 1 year ago</p>
                    </div>
                </aside>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white border-b px-6 py-2 flex justify-between items-center">
                        <Tabs defaultValue="connections" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="joining">Joining</TabsTrigger>
                                <TabsTrigger value="contacts">Address & Contacts</TabsTrigger>
                                <TabsTrigger value="attendance">Attendance & Leaves</TabsTrigger>
                                <TabsTrigger value="salary">Salary</TabsTrigger>
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="exit">Exit</TabsTrigger>
                                <TabsTrigger value="connections">Connections</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                        <Tabs defaultValue="connections" className="w-full">
                            <TabsContent value="overview">
                                 <Card><CardContent className="p-4">Overview content goes here.</CardContent></Card>
                            </TabsContent>
                             <TabsContent value="connections">
                                <ConnectionsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}

