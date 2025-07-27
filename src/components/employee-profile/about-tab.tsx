
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, User, Mail, Briefcase, Building, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/mock-data/employees';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const ActivityCalendar = () => {
    // This is a simplified mock. In a real app, this would be dynamic.
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const statusData = [
        ...Array(5).fill('Day Off'), 
        ...Array(5).fill('Present'),
        ...Array(2).fill('Day Off'),
        { status: 'Present', checkIn: '09:01 AM', checkOut: '06:01 PM' },
        { status: 'Absent', reason: 'Unplanned Leave' },
        ...Array(3).fill('Present'),
        ...Array(2).fill('Day Off'),
        { status: 'Present', checkIn: '08:57 AM', checkOut: '06:04 PM' },
        { status: 'Applied Leave', reason: 'Sick Leave' },
        ...Array(3).fill('Present'),
        ...Array(2).fill('Day Off'),
        { status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
        { status: 'Half Day', checkIn: '09:00 AM', reason: 'Personal Emergency' },
        { status: 'Absent', reason: 'Unplanned Leave' },
        { status: 'Present', checkIn: '09:02 AM', checkOut: '05:58 PM' },
        { status: 'Present', checkIn: '08:55 AM' }, // Today
        { status: 'Day Off' },
    ];

    const getDayClass = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-500';
            case 'Absent': return 'bg-red-500';
            case 'Applied Leave': return 'bg-yellow-400';
            case 'Day Off': return 'bg-gray-200';
            case 'Half Day': return 'half-day';
            default: return 'bg-gray-200';
        }
    };

    return (
        <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">Activity</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                       <span>September 2023</span> <ChevronDown className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                       <Download className="h-4 w-4"/> <span>Report</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 gap-2">
                   {/* This is a simplified static grid for display */}
                   {Array.from({length: 4}).map((_, i) => <div key={`pad-${i}`} className="text-right text-gray-400 text-sm p-1">{27+i}</div>)}
                   {statusData.map((dayStatus, index) => {
                        const day = index + 1;
                        const isToday = day === 29;
                        const status = typeof dayStatus === 'string' ? dayStatus : dayStatus.status;
                        const dayData = typeof dayStatus === 'object' ? dayStatus : { status };

                        return (
                             <TooltipProvider key={index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="p-1 text-right relative group cursor-pointer hover:bg-blue-50 rounded-md">
                                            <span className={cn("text-sm", isToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto")}>{day}</span>
                                            <div className="w-full h-1.5 rounded-full mt-1">
                                                {status === 'Half Day' ? (
                                                    <div className="flex h-full w-full rounded-full overflow-hidden">
                                                        <div className="w-1/2 bg-green-500"></div>
                                                        <div className="w-1/2 bg-red-500"></div>
                                                    </div>
                                                ) : (
                                                    <div className={cn("w-full h-full rounded-full", getDayClass(status))}></div>
                                                )}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">Sept {day}, 2023 {isToday && '(Today)'}</p>
                                        <p>Status: {status}</p>
                                        {dayData.checkIn && <p>Check-in: {dayData.checkIn}</p>}
                                        {dayData.checkOut && <p>Check-out: {dayData.checkOut}</p>}
                                        {dayData.reason && <p>Reason: {dayData.reason}</p>}
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        )
                    })}
                    {Array.from({length: 1}).map((_, i) => <div key={`pad2-${i}`} className="text-right text-gray-400 text-sm p-1">{1+i}</div>)}

                </div>
                 <div className="flex items-center justify-end space-x-4 mt-6 text-xs text-gray-600">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Present</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Absent</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full relative overflow-hidden"><div className="absolute inset-0 w-1/2 bg-green-500"></div><div className="absolute inset-0 w-1/2 bg-red-500 ml-[50%]"></div></div><span>Half Day</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span>Applied Leave</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div><span>Day Off</span></div>
                </div>
            </CardContent>
        </Card>
    )
}

export function AboutTab({ employee }: { employee: UserProfile }) {
    const { toast } = useToast();
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});
    const { user } = useAuth();

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
                 <ActivityCalendar />
             </div>
        </div>
    )
}
