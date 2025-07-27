
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Building, Briefcase, User, Loader2, Plus, Edit, Star, HeartPulse, BookUser, FileText } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type EmployeeProfile = typeof mockEmployees[0];

function InfoCard({ title, icon: Icon, children, onEdit }: { title: string, icon: React.ElementType, children: React.ReactNode, onEdit?: () => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span>{title}</span>
                </CardTitle>
                {onEdit && (
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

function InfoRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed last:border-none">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-medium text-sm text-right">{value || 'N/A'}</span>
        </div>
    )
}


function AboutTab({ employee, manager }: { employee: EmployeeProfile, manager: EmployeeProfile | null }) {
    const { toast } = useToast();
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});

    if(!employee) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                 <InfoCard title="Basic Information" icon={User} onEdit={() => handleEdit('Basic Info')}>
                    <InfoRow label="Employee ID" value={employee.employee_id} />
                    <InfoRow label="Date of Birth" value={"July 20, 1995"} />
                    <InfoRow label="Gender" value={"Female"} />
                    <InfoRow label="Marital Status" value={"Married"} />
                    <InfoRow label="Nationality" value={"Indian"} />
                </InfoCard>

                <InfoCard title="Contact Information" icon={Mail} onEdit={() => handleEdit('Contact Info')}>
                    <InfoRow label="Work Email" value={mockEmployees.find(u => u.employee_id === employee.employee_id)?.email || 'N/A'} />
                    <InfoRow label="Personal Email" value={"anika.sharma@email.com"} />
                    <InfoRow label="Phone Number" value={employee.phone_number} />
                </InfoCard>
            </div>
             <div className="lg:col-span-2 space-y-6">
                 <InfoCard title="Position Details" icon={Briefcase} onEdit={() => handleEdit('Position Details')}>
                    <InfoRow label="Company" value={"OptiTalent Inc."} />
                    <InfoRow label="Department" value={employee.department.name} />
                    <InfoRow label="Job Title" value={employee.job_title} />
                    {manager && <InfoRow label="Reporting Manager" value={manager.full_name} />}
                    <InfoRow label="Date of Joining" value={"July 25, 2022"} />
                    <InfoRow label="Employment Type" value={"Permanent"} />
                    <InfoRow label="Location" value={"Mangaluru, IN"} />
                </InfoCard>
                 <InfoCard title="Address Details" icon={Building} onEdit={() => handleEdit('Address')}>
                    <div className="space-y-1">
                        <p className="font-medium text-sm">Current Address</p>
                        <p className="text-sm text-muted-foreground">#123, Rose Villa, Richmond Town, Bengaluru, Karnataka - 560025</p>
                    </div>
                     <Separator className="my-3"/>
                     <div className="space-y-1">
                        <p className="font-medium text-sm">Permanent Address</p>
                        <p className="text-sm text-muted-foreground">#45, Sunshine Apartments, Bandra West, Mumbai, Maharashtra - 400050</p>
                    </div>
                </InfoCard>
             </div>
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
    
    const manager = useMemo(() => {
        if (!employee) return null;
        return mockEmployees.find(m => m.role === 'manager' && m.department.name === employee.department.name) || null;
    }, [employee]);

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
                    <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employee List
                </Button>
                <div className="flex items-center justify-between">
                     <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Employee Profile
                        <span className="text-gray-400 font-light mx-2">/</span> 
                        <span className="text-primary">{employee.employee_id}</span>
                    </h1>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">Edit</Button>
                        <Button>Save</Button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden mt-6">
                <aside className="w-80 bg-card border-r p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="flex justify-center mb-6">
                             <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-primary">
                                <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                                <AvatarFallback className="text-4xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                         <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{employee.full_name}</h2>
                             <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className="mt-1">{employee.status}</Badge>
                        </div>
                        <nav className="space-y-1">
                             <Button variant="ghost" className="w-full justify-between"><span>Assigned To</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                             <Button variant="ghost" className="w-full justify-between"><span>Attachments</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                             <Button variant="ghost" className="w-full justify-between"><span>Reviews</span> <Plus className="h-4 w-4 text-muted-foreground"/></Button>
                        </nav>
                    </div>
                     <div className="text-xs text-gray-400 space-y-1">
                        <p>Last updated: 22 minutes ago</p>
                        <p>Created: 1 year ago</p>
                    </div>
                </aside>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Tabs defaultValue="about" className="flex flex-col h-full">
                        <TabsList className="mx-6">
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="joining">Joining</TabsTrigger>
                            <TabsTrigger value="contacts">Address & Contacts</TabsTrigger>
                            <TabsTrigger value="attendance">Attendance & Leaves</TabsTrigger>
                             <TabsTrigger value="personal">Personal</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 p-6 overflow-y-auto bg-muted/40">
                             <TabsContent value="about">
                                <AboutTab employee={employee} manager={manager} />
                            </TabsContent>
                            <TabsContent value="joining"><Card><CardContent className="p-6">Joining details coming soon.</CardContent></Card></TabsContent>
                            <TabsContent value="contacts"><Card><CardContent className="p-6">Contact details coming soon.</CardContent></Card></TabsContent>
                            <TabsContent value="attendance"><Card><CardContent className="p-6">Attendance details coming soon.</CardContent></Card></TabsContent>
                            <TabsContent value="personal"><Card><CardContent className="p-6">Personal details coming soon.</CardContent></Card></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
