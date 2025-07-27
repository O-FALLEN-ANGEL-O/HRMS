
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


type EmployeeProfile = typeof mockEmployees[0];

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
                        <Tabs defaultValue="about" className="w-full">
                            <TabsList>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="professional">Professional</TabsTrigger>
                                <TabsTrigger value="family-health">Family & Health</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
                        <Tabs defaultValue="about" className="w-full">
                            <TabsContent value="about">
                                <AboutTab employee={employee} />
                            </TabsContent>
                            <TabsContent value="professional">
                                <ProfessionalTab />
                            </TabsContent>
                             <TabsContent value="family-health">
                                <FamilyHealthTab />
                            </TabsContent>
                             <TabsContent value="documents">
                                <DocumentsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
