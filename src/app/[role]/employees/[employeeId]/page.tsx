
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockUsers } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Mail, Phone, Building, Briefcase, User, Heart, MessageSquare, Trash2, ChevronRight, MoreHorizontal, ChevronLeft, Download, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AboutTab, ActivityCalendar } from '@/components/employee-profile/about-tab';
import { ProfessionalTab } from '@/components/employee-profile/professional-tab';
import { FamilyHealthTab } from '@/components/employee-profile/family-health-tab';
import { DocumentsTab } from '@/components/employee-profile/documents-tab';
import { HRInformationTab } from '@/components/employee-profile/hr-information-tab';
import type { UserProfile } from '@/lib/mock-data/employees';


export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: loggedInUser } = useAuth();
    const [employee, setEmployee] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const employeeId = params.employeeId as string;

    useEffect(() => {
        const foundEmployee = mockUsers.find(e => e.profile.employee_id === employeeId)?.profile;
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

    const canViewDetailedProfile = loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'hr' || loggedInUser.role === 'manager' || loggedInUser.role === 'team-leader' || loggedInUser.role === 'qa-analyst' || loggedInUser.role === 'trainer');

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
                     <Tabs defaultValue="about" className="w-full flex-1 flex flex-col">
                        <div className="bg-white border-b px-6 py-2 flex justify-between items-center">
                            <TabsList>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="professional">Professional</TabsTrigger>
                                <TabsTrigger value="family">Family & Health</TabsTrigger>
                                <TabsTrigger value="hr">HR Information</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                            <TabsContent value="about">
                                <AboutTab employee={employee}/>
                            </TabsContent>
                            <TabsContent value="professional">
                                <ProfessionalTab />
                            </TabsContent>
                            <TabsContent value="family">
                                <FamilyHealthTab />
                            </TabsContent>
                             <TabsContent value="hr">
                                <HRInformationTab />
                            </TabsContent>
                            <TabsContent value="documents">
                                <DocumentsTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
