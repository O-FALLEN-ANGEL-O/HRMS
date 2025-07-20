
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit, AtSign, Phone, Briefcase, User } from "lucide-react";

function ProfileInfo() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                <span>{user?.email}</span>
            </div>
             <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(123) 456-7890</span>
            </div>
             <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{user?.profile?.department || 'Not Assigned'}</span>
            </div>
        </div>
        <h3 className="text-lg font-medium pt-4">Address</h3>
         <div className="space-y-2 text-sm text-muted-foreground">
            <p>123 Main Street</p>
            <p>Anytown, USA 12345</p>
        </div>
    </div>
  )
}


export default function ProfilePage() {
    const { user } = useAuth();
    const userName = user?.profile?.name || user?.email || 'User';
    const userRole = user?.role === 'admin' ? 'Administrator' : user?.profile?.department || 'Employee';

  return (
    <div className="space-y-6">
       <div className="pb-4">
          <h1 className="text-3xl font-bold font-headline">Profile</h1>
          <p className="text-muted-foreground">View and manage your personal details.</p>
        </div>
       <Card>
        <CardHeader className="relative">
            <div className="absolute top-4 right-4">
                <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
            </div>
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://placehold.co/100x100" data-ai-hint="person avatar" />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl font-headline">{userName}</CardTitle>
                    <CardDescription className="text-lg">{userRole}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="leave">Leave</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="pt-6">
                    <ProfileInfo />
                </TabsContent>
                <TabsContent value="attendance" className="pt-6">
                    <p className="text-center text-muted-foreground">Attendance records will be shown here.</p>
                </TabsContent>
                 <TabsContent value="leave" className="pt-6">
                    <p className="text-center text-muted-foreground">Leave history will be shown here.</p>
                </TabsContent>
                 <TabsContent value="payroll" className="pt-6">
                    <p className="text-center text-muted-foreground">Payroll details will be shown here.</p>
                </TabsContent>
                 <TabsContent value="performance" className="pt-6">
                    <p className="text-center text-muted-foreground">Performance review data will be shown here.</p>
                </TabsContent>
            </Tabs>
        </CardContent>
       </Card>
    </div>
  )
}
