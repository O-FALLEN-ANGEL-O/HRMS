
'use client'

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Phone, Plus, History, Gift, Award, FileText, BarChart, FileQuestion, Briefcase, Star, Building, Users, HeartPulse, Shield, BookUser, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockEmployees } from "@/lib/mock-data/employees";

const MOCK_USER = mockEmployees[4]; // Defaulting to Anika Sharma (employee)

// --- MOCK DATA FOR PROFILE TABS ---
const professionalInfo = {
    experience: [
        { role: 'UI/UX Designer', company: 'CreativeMinds Inc.', dates: '2020 - 2022' },
        { role: 'Jr. Designer', company: 'DesignWorks Co.', dates: '2019 - 2020' },
    ],
    education: [
        { degree: 'B.Des in Visual Communication', institution: 'National Institute of Design', year: '2019' },
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'HTML/CSS'],
    certifications: [
        { name: 'Certified UX Professional', authority: 'Nielsen Norman Group', year: '2021' },
    ]
};

const familyAndHealthInfo = {
    dependents: [
        { name: 'Ravi Sharma', relationship: 'Spouse', dob: '1990-05-15' },
        { name: 'Priya Sharma', relationship: 'Daughter', dob: '2022-01-20' },
    ],
    health: {
        bloodGroup: 'O+',
        allergies: 'None',
    },
    emergencyContact: {
        name: 'Ravi Sharma',
        relationship: 'Spouse',
        phone: '987-654-3210',
    }
};

const documents = [
    { name: 'Offer Letter', category: 'Onboarding', date: '2022-07-01' },
    { name: 'Employee Handbook Acknowledgement', category: 'Policies', date: '2022-07-25' },
    { name: 'Form 16 - 2023', category: 'Tax', date: '2024-06-15' },
];


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

function AboutTab() {
    const { toast } = useToast();
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                 <InfoCard title="Basic Information" icon={User} onEdit={() => handleEdit('Basic Info')}>
                    <InfoRow label="Employee ID" value={MOCK_USER.employee_id} />
                    <InfoRow label="Date of Birth" value={"July 20, 1995"} />
                    <InfoRow label="Gender" value={"Female"} />
                    <InfoRow label="Marital Status" value={"Married"} />
                    <InfoRow label="Nationality" value={"Indian"} />
                </InfoCard>

                <InfoCard title="Contact Information" icon={Mail} onEdit={() => handleEdit('Contact Info')}>
                    <InfoRow label="Work Email" value={MOCK_USER.email} />
                    <InfoRow label="Personal Email" value={"anika.sharma@email.com"} />
                    <InfoRow label="Phone Number" value={MOCK_USER.phone_number} />
                </InfoCard>
            </div>
             <div className="lg:col-span-2 space-y-6">
                 <InfoCard title="Position Details" icon={Briefcase} onEdit={() => handleEdit('Position Details')}>
                    <InfoRow label="Company" value={"OptiTalent Inc."} />
                    <InfoRow label="Department" value={MOCK_USER.department.name} />
                    <InfoRow label="Job Title" value={MOCK_USER.job_title} />
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

function ProfessionalTab() {
     const { toast } = useToast();
     const handleAdd = (section: string) => toast({title: `Add ${section}`, description: "This would open a form dialog."});
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary"/> Work Experience</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Experience')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {professionalInfo.experience.map((exp, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Briefcase className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-semibold">{exp.role}</p>
                                    <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.dates}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/> Education</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Education')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {professionalInfo.education.map((edu, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Award className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-semibold">{edu.degree}</p>
                                    <p className="text-sm text-muted-foreground">{edu.institution} &middot; {edu.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary"/> Skills & Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <h4 className="font-semibold mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {professionalInfo.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                    <Separator className="my-4"/>
                    <div>
                        <h4 className="font-semibold mb-2">Certifications</h4>
                        <ul className="space-y-2">
                            {professionalInfo.certifications.map((cert, i) => (
                                <li key={i} className="text-sm">
                                    <span className="font-medium">{cert.name}</span> - <span className="text-muted-foreground">{cert.authority}, {cert.year}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function FamilyHealthTab() {
    const { toast } = useToast();
    const handleAdd = (section: string) => toast({title: `Add ${section}`, description: "This would open a form dialog."});
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Family & Dependents</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Dependent')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Name</TableHead>
                               <TableHead>Relationship</TableHead>
                               <TableHead>Date of Birth</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {familyAndHealthInfo.dependents.map((dep, i) => (
                               <TableRow key={i}>
                                   <TableCell className="font-medium">{dep.name}</TableCell>
                                   <TableCell>{dep.relationship}</TableCell>
                                   <TableCell>{dep.dob}</TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/> Health & Emergency</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleEdit('Health Info')}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                   <div>
                        <h4 className="font-semibold mb-2">Health Information</h4>
                        <InfoRow label="Blood Group" value={familyAndHealthInfo.health.bloodGroup} />
                        <InfoRow label="Allergies" value={familyAndHealthInfo.health.allergies} />
                   </div>
                   <div>
                        <h4 className="font-semibold mb-2">Emergency Contact</h4>
                        <InfoRow label="Contact Name" value={familyAndHealthInfo.emergencyContact.name} />
                        <InfoRow label="Relationship" value={familyAndHealthInfo.emergencyContact.relationship} />
                        <InfoRow label="Phone Number" value={familyAndHealthInfo.emergencyContact.phone} />
                   </div>
                </CardContent>
            </Card>
        </div>
    )
}

function DocumentsTab() {
     const { toast } = useToast();
     const handleDownload = (docName: string) => toast({title: `Downloading ${docName}`});

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookUser className="h-5 w-5 text-primary"/> My Documents</CardTitle>
                <CardDescription>View and download your important employment documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell><Badge variant="secondary">{doc.category}</Badge></TableCell>
                                <TableCell>{doc.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.name)}>
                                        <Download className="mr-2 h-4 w-4"/> Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
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

            <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="about"><User className="mr-2 h-4 w-4"/>About</TabsTrigger>
                    <TabsTrigger value="professional"><Briefcase className="mr-2 h-4 w-4"/>Professional</TabsTrigger>
                    <TabsTrigger value="family-health"><Users className="mr-2 h-4 w-4"/>Family & Health</TabsTrigger>
                    <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="about">
                    <AboutTab />
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
    );
}

    