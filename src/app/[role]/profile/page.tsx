
'use client'

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Phone, Plus, History, Gift, Award, FileText, BarChart, FileQuestion, Briefcase, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockEmployees } from "@/lib/mock-data/employees";

const MOCK_USER = mockEmployees[4]; // Defaulting to Anika Sharma (employee)

function InfoCard({ title, children, onEdit }: { title: string, children: React.ReactNode, onEdit?: () => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                {onEdit && (
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Edit className="h-4 w-4" />
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
        <div className="flex justify-between py-2 border-b border-dashed">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-medium text-sm text-right">{value}</span>
        </div>
    )
}


function AboutTab() {
    const { toast } = useToast();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                 <InfoCard title="Basic Information" onEdit={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}>
                    <InfoRow label="Employee ID" value={MOCK_USER.employee_id} />
                    <InfoRow label="Job Title" value={MOCK_USER.job_title} />
                    <InfoRow label="Email" value={MOCK_USER.email} />
                    <InfoRow label="Phone" value={MOCK_USER.phone_number} />
                    <InfoRow label="Date of Birth" value={"July 20, 1995"} />
                    <InfoRow label="Blood Group" value={"B+"} />
                </InfoCard>

                <InfoCard title="Employment Status" onEdit={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}>
                    <InfoRow label="Date of Joining" value={"July 25, 2022"} />
                    <InfoRow label="Employment Type" value={"Permanent"} />
                    <InfoRow label="Probation Status" value={"Confirmed"} />
                </InfoCard>
            </div>
             <div className="lg:col-span-2 space-y-6">
                 <InfoCard title="Position Details" onEdit={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}>
                    <InfoRow label="Company" value={"OptiTalent Inc."} />
                    <InfoRow label="Department" value={MOCK_USER.department.name} />
                    <InfoRow label="Reporting Manager" value={"Isabella Nguyen"} />
                    <InfoRow label="Location" value={"Mangaluru, IN"} />
                </InfoCard>
                <InfoCard title="Emergency Contact" onEdit={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}>
                    <InfoRow label="Contact Name" value={"John Doe (Father)"} />
                    <InfoRow label="Relationship" value={"Father"} />
                    <InfoRow label="Phone Number" value={"(987) 654-3210"} />
                </InfoCard>
                 <InfoCard title="Signature" onEdit={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}>
                     <div className="flex justify-center items-center h-24 bg-muted/50 rounded-md">
                        <p className="font-mono text-lg italic text-muted-foreground select-none">{MOCK_USER.full_name}</p>
                     </div>
                </InfoCard>
             </div>
        </div>
    )
}


export default function ProfilePage() {
    const { toast } = useToast();

    if (!MOCK_USER) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={MOCK_USER.profile_picture_url} data-ai-hint="person portrait" alt={MOCK_USER.full_name} />
                            <AvatarFallback>{MOCK_USER.full_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold font-headline">{MOCK_USER.full_name}</h1>
                            <p className="text-muted-foreground">{MOCK_USER.job_title}</p>
                        </div>
                         <Button variant="outline" onClick={() => toast({title: "Edit Action", description: "This would open an edit dialog."})}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="family">Family</TabsTrigger>
                    <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>
                <TabsContent value="about">
                    <AboutTab />
                </TabsContent>
                <TabsContent value="professional">
                     <Card>
                        <CardHeader><CardTitle>Professional Details</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">This section will contain details about skills, certifications, and work experience.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="family">
                     <Card>
                        <CardHeader><CardTitle>Family Information</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">This section will contain details about family members and dependents.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="health">
                     <Card>
                        <CardHeader><CardTitle>Health Information</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">This section will contain details about health insurance and medical history.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
