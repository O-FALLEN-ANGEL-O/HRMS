
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockUsers } from '@/lib/mock-data/employees';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Mail, Phone, Building, Briefcase, User, Heart, MessageSquare, Trash2, ChevronRight, MoreHorizontal, ChevronLeft, Download, Save, X, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { AboutTab } from '@/components/employee-profile/about-tab';
import { ProfessionalTab } from '@/components/employee-profile/professional-tab';
import { FamilyHealthTab } from '@/components/employee-profile/family-health-tab';
import { DocumentsTab } from '@/components/employee-profile/documents-tab';
import { HRInformationTab } from '@/components/employee-profile/hr-information-tab';
import type { UserProfile } from '@/lib/mock-data/employees';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: loggedInUser } = useAuth();
    const { toast } = useToast();
    
    const [employee, setEmployee] = useState<UserProfile | null>(null);
    const [originalEmployee, setOriginalEmployee] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const employeeId = params.employeeId as string;

    useEffect(() => {
        const foundUser = mockUsers.find(e => e.profile.employee_id === employeeId);
        if (foundUser) {
            // Deep copy to prevent mutation of the mock "database"
            const employeeProfile = JSON.parse(JSON.stringify(foundUser.profile));
            setEmployee(employeeProfile);
            setOriginalEmployee(JSON.parse(JSON.stringify(foundUser.profile)));
        }
        setLoading(false);
    }, [employeeId]);
    
    const handleFieldChange = (path: string, value: any) => {
        setEmployee(prev => {
            if (!prev) return null;
            // Create a deep copy to edit
            const newEmployee = JSON.parse(JSON.stringify(prev));
            
            // Navigate the path and set the value
            const keys = path.split('.');
            let current: any = newEmployee;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            return newEmployee;
        });
    };

    const handleSave = () => {
        setOriginalEmployee(employee); // Persist changes to the "original" state for this session
        setIsEditing(false);
        
        // In a real app, this would be an API call to update the database
        const index = mockUsers.findIndex(u => u.profile.employee_id === employeeId);
        if (index > -1 && employee) {
            mockUsers[index].profile = employee;
        }
        
        console.log("Saving employee data:", employee);
        toast({
            title: "Changes Saved",
            description: "Employee data has been updated.",
        });
    };
    
    const handleCancel = () => {
        setEmployee(originalEmployee); // Revert to the last saved state
        setIsEditing(false);
    }
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!employee) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Employee Not Found</h2>
                    <p className="text-muted-foreground">The employee with ID "{employeeId}" could not be found.</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </CardContent>
            </Card>
        );
    }
    
    // Determine if the logged-in user has permission to see detailed profiles
    const canViewDetailedProfile = loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'hr' || loggedInUser.role === 'manager' || loggedInUser.role === 'team-leader' || loggedInUser.role === 'qa-analyst' || loggedInUser.role === 'trainer' || loggedInUser.role === 'finance' || loggedInUser.role === 'it-manager');

    // If the logged-in user is the employee themselves, they can see their own profile.
    if (!canViewDetailedProfile && loggedInUser?.profile.employee_id !== employeeId) {
        return (
             <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Access Denied</h2>
                    <p className="text-muted-foreground">You do not have permission to view this detailed employee profile.</p>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0">
                <div className="flex items-center justify-between">
                     <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">Employee</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-foreground font-medium">{employee.employee_id}</span>
                     </div>
                    <div className="flex items-center space-x-2">
                         {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-2"/>Cancel</Button>
                                <Button onClick={handleSave}><Save className="h-4 w-4 mr-2"/>Save</Button>
                            </>
                        ) : (
                            canViewDetailedProfile && <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden mt-6">
                <aside className="w-80 bg-card border-r p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col items-center text-center mb-6">
                             <Avatar className="w-24 h-24 rounded-full mb-4">
                                <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                                <AvatarFallback className="text-4xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                             {isEditing ? (
                                <Input 
                                    className="text-xl font-bold text-center h-auto p-0 border-0 focus-visible:ring-1"
                                    value={employee.full_name} 
                                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                />
                             ) : (
                                <h1 className="text-xl font-bold">{employee.full_name}</h1>
                             )}
                            <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">{employee.status}</Badge>
                        </div>
                    </div>
                     <div className="text-xs text-muted-foreground space-y-1 text-center">
                        <p>You last edited this · 22 minutes ago</p>
                        <p>You created this · 1 year ago</p>
                    </div>
                </aside>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                     <Tabs defaultValue="about" className="w-full flex-1 flex flex-col">
                        <div className="bg-card border-b px-6 py-2 flex justify-between items-center">
                            <TabsList>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="professional">Professional</TabsTrigger>
                                <TabsTrigger value="family">Family & Health</TabsTrigger>
                                {canViewDetailedProfile && <TabsTrigger value="hr">HR Information</TabsTrigger>}
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
                            <TabsContent value="about">
                                <AboutTab employee={employee} isEditing={isEditing} onFieldChange={handleFieldChange} canEdit={canViewDetailedProfile}/>
                            </TabsContent>
                            <TabsContent value="professional">
                                <ProfessionalTab employee={employee} isEditing={isEditing} setEmployee={setEmployee}/>
                            </TabsContent>
                            <TabsContent value="family">
                                <FamilyHealthTab employee={employee} isEditing={isEditing} setEmployee={setEmployee}/>
                            </TabsContent>
                             {canViewDetailedProfile && <TabsContent value="hr">
                                <HRInformationTab />
                            </TabsContent>}
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
