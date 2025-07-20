"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // In a real app, you'd fetch these from your backend
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: user?.email || "admin@optitalent.com",
    jobTitle: "Administrator",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newApplicants: true,
    payrollUpdates: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleNotificationChange = (name: string) => {
    setNotifications(prev => ({ ...prev, [name]: !prev[name as keyof typeof notifications]}));
  };

  const handleSaveChanges = () => {
    // In a real app, you'd send this data to your API
    console.log("Saving changes:", { profile, notifications });
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div>
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" value={profile.jobTitle} onChange={handleProfileChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates and alerts in your inbox.</p>
                </div>
                <Switch id="email-notifications" checked={notifications.email} onCheckedChange={() => handleNotificationChange('email')}/>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get real-time alerts on your devices.</p>
                </div>
                <Switch id="push-notifications" checked={notifications.push} onCheckedChange={() => handleNotificationChange('push')} disabled/>
            </div>
             <Separator/>
             <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">New applicant alerts</p>
                <Switch checked={notifications.newApplicants} onCheckedChange={() => handleNotificationChange('newApplicants')}/>
            </div>
             <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Payroll processing updates</p>
                <Switch checked={notifications.payrollUpdates} onCheckedChange={() => handleNotificationChange('payrollUpdates')}/>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
