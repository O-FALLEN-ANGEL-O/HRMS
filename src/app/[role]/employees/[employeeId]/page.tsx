
'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Building, Briefcase, User, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

type EmployeeProfile = typeof mockEmployees[0];

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4 p-3 border-b last:border-none">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
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
        // This is a simplified mock logic. In a real app, you'd have a proper manager_id field.
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
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employee List
                </Button>
            </div>
            <Card>
                <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background ring-2 ring-primary">
                        <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person avatar" />
                        <AvatarFallback className="text-3xl">{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-headline">{employee.full_name}</CardTitle>
                    <CardDescription>{employee.job_title}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <InfoRow icon={User} label="Employee ID" value={employee.employee_id} />
                    <InfoRow icon={Phone} label="Contact Number" value={employee.phone_number || 'Not provided'} />
                    <InfoRow icon={Building} label="Department" value={employee.department.name} />
                    <InfoRow icon={Briefcase} label="Position" value={employee.job_title} />
                    {manager && (
                         <InfoRow icon={User} label="Reporting Manager" value={`${manager.full_name} (${manager.employee_id})`} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
