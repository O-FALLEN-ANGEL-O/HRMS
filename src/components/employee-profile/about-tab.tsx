
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, User, Mail, Briefcase, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/mock-data/employees';

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

export function AboutTab({ employee }: { employee: UserProfile }) {
    const { toast } = useToast();
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});
    const { user } = useAuth(); // Assuming useAuth provides the logged-in user context

    if(!user || !employee) return null;

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
                    <InfoRow label="Work Email" value={employee.email} />
                    <InfoRow label="Personal Email" value={"anika.sharma@email.com"} />
                    <InfoRow label="Phone Number" value={employee.phone_number} />
                </InfoCard>
            </div>
             <div className="lg:col-span-2 space-y-6">
                 <InfoCard title="Position Details" icon={Briefcase} onEdit={() => handleEdit('Position Details')}>
                    <InfoRow label="Company" value={"OptiTalent Inc."} />
                    <InfoRow label="Department" value={employee.department.name} />
                    <InfoRow label="Job Title" value={employee.job_title} />
                    <InfoRow label="Reporting Manager" value={"Isabella Nguyen"} />
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
