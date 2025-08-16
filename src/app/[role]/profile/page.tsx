
'use client'

import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Phone, Plus, History, Gift, Award, FileText, BarChart, FileQuestion, Briefcase, Star, Building, Users, HeartPulse, Shield, BookUser, Download, User, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile } from '@/lib/mock-data/employees';
import { AboutTab } from '@/components/employee-profile/about-tab';
import { ProfessionalTab } from '@/components/employee-profile/professional-tab';
import { FamilyHealthTab } from '@/components/employee-profile/family-health-tab';
import { DocumentsTab } from '@/components/employee-profile/documents-tab';
import { mockUsers } from "@/lib/mock-data/employees";


export default function ProfilePage() {
    const { toast } = useToast();
    const { user, loading, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [employee, setEmployee] = useState<UserProfile | null>(null);
    const [originalEmployee, setOriginalEmployee] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user) {
            const currentProfile = JSON.parse(JSON.stringify(user.profile));
            setEmployee(currentProfile);
            setOriginalEmployee(currentProfile);
        }
    }, [user]);

    const handleSave = () => {
        if (!employee || !user) return;
        
        // Find the user in the mock database and update their profile
        const userIndex = mockUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            mockUsers[userIndex].profile = employee;
        }

        // To see changes reflected immediately, we also need to "re-login"
        // to update the user object in the AuthContext.
        login(employee.employee_id);

        setIsEditing(false);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved.",
        });
    };

    const handleCancel = () => {
        setEmployee(originalEmployee);
        setIsEditing(false);
    };

    if (loading || !user || !employee) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={employee.profile_picture_url || ''} data-ai-hint="person portrait" alt={employee.full_name} />
                            <AvatarFallback>{employee.full_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold font-headline">{employee.full_name}</h1>
                            <p className="text-muted-foreground">{employee.job_title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</span>
                                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{employee.phone_number}</span>
                            </div>
                        </div>
                        {isEditing ? (
                             <div className="flex gap-2">
                                <Button variant="outline" onClick={handleCancel}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
                            </div>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                        )}
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
                    <AboutTab employee={employee} isEditing={isEditing} setEmployee={setEmployee} canEdit={true} />
                </TabsContent>
                <TabsContent value="professional">
                     <ProfessionalTab employee={employee} isEditing={isEditing} setEmployee={setEmployee} />
                </TabsContent>
                 <TabsContent value="family-health">
                    <FamilyHealthTab employee={employee} isEditing={isEditing} setEmployee={setEmployee} />
                </TabsContent>
                 <TabsContent value="documents">
                    <DocumentsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
