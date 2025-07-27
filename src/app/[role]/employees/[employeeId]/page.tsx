
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Mail, Phone, Building, Briefcase, User, Heart, MessageSquare, Trash2, ChevronRight, MoreHorizontal, ChevronLeft } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type EmployeeProfile = typeof mockEmployees[0];

const ActivityHeatmap = () => {
    const months = ['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'];
    const days = ['Mon', 'Wed', 'Fri'];
    
    // Create a grid of random activity levels
    const activityGrid = Array.from({ length: 53 * 3 }, () => Math.random());

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Activity</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex space-x-4 text-xs text-gray-500 mb-2">
                    <div className="w-8"></div>
                    <div className="grid grid-cols-12 gap-1 flex-1">
                        {months.map(m => <span key={m}>{m}</span>)}
                    </div>
                </div>
                 <div className="flex space-x-4">
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                        {days.map(d => <span key={d} className="h-3">{d}</span>)}
                    </div>
                    <div className="grid grid-flow-col grid-rows-3 gap-1 flex-1">
                        {activityGrid.map((activity, index) => {
                            let color = 'bg-gray-200 dark:bg-muted/50';
                            if (activity > 0.8) color = 'bg-green-600';
                            else if (activity > 0.5) color = 'bg-green-400';
                            else if (activity > 0.2) color = 'bg-green-200';
                            
                            // Simulate the green block from the image
                            if (index > 80 && index < 120) {
                                color = 'bg-green-500';
                            }
                            
                            return <div key={index} className={`${color} h-3 w-3 rounded-sm`}></div>
                        })}
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">This is based on the attendance of this Employee</p>
            </CardContent>
        </Card>
    )
};


const ConnectionCard = ({ title, items }: { title: string, items: {label: string, count?: number}[] }) => (
    <div>
        <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="space-y-3">
            {items.map(item => (
                <button key={item.label} className="w-full flex justify-between items-center bg-gray-100 p-3 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                    <span className="flex items-center">
                        {item.count && <span className="bg-white border rounded-md px-1.5 py-0.5 mr-2 text-xs">{item.count}</span>}
                        {item.label}
                    </span>
                    <Plus className="h-4 w-4 text-gray-500"/>
                </button>
            ))}
        </div>
    </div>
);


function ConnectionsTab() {
    const attendanceItems = [ { label: '99+ Attendance' }, { label: 'Attendance Request'}, { label: 'Employee Checkin'}];
    const leaveItems = [ { label: 'Leave Application', count: 3}, { label: 'Leave Allocation', count: 2}, { label: 'Leave Policy Assignment'}];
    const lifecycleItems = [ { label: 'Employee Onboarding'}, { label: 'Employee Transfer'}, { label: 'Employee Promotion'}, { label: 'Employee Grievance', count: 1}];
    
    return (
        <div className="space-y-6">
            <ActivityHeatmap />
            <Card>
                 <CardHeader>
                    <CardTitle className="text-lg font-semibold">Connections</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ConnectionCard title="Attendance" items={attendanceItems} />
                    <ConnectionCard title="Leave" items={leaveItems} />
                    <ConnectionCard title="Lifecycle" items={lifecycleItems} />
                </CardContent>
            </Card>
        </div>
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
                    <Button onClick={() => router.back()}> Go Back</Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0">
                <div className="flex items-center justify-between">
                     <div className="flex items-center text-sm">
                        <span className="text-gray-500">Employee</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                        <span className="text-gray-800 font-medium">{employee.employee_id}</span>
                     </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">Edit</Button>
                        <Button>Save</Button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden mt-6">
                <aside className="w-80 bg-white border-r p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-6">
                             <h1 className="text-xl font-bold text-gray-800">{employee.full_name}</h1>
                             <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className="ml-3 bg-green-100 text-green-700">{employee.status}</Badge>
                        </div>
                        <div className="flex justify-center mb-6">
                             <Avatar className="w-40 h-40">
                                <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                                <AvatarFallback className="text-4xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                        <nav className="space-y-2">
                            <Button variant="ghost" className="w-full justify-between text-gray-600"><span>Assigned To</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600"><span>Attachments</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <div className="flex items-center justify-between bg-gray-100 rounded-md p-2 text-sm">
                                <span className="text-gray-700">adam7bc121.jpeg</span>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-gray-600"><span>Reviews</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600"><span>Tags</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                            <Button variant="ghost" className="w-full justify-between text-gray-600"><span>Share</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
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
                    <div className="bg-white border-b border-gray-200 px-6 py-2 flex justify-between items-center">
                        <Tabs defaultValue="connections" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="joining">Joining</TabsTrigger>
                                <TabsTrigger value="address">Address & Contacts</TabsTrigger>
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
                        {/* The content would be driven by the selected tab. For now, showing Connections. */}
                        <ConnectionsTab />
                    </div>
                </div>
            </main>
        </div>
    );
}
