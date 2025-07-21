
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Shield, User, Monitor, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.profile?.name || "Admin User",
    email: user?.email || "admin@optitalent.com",
    jobTitle: "Administrator",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [notifications, setNotifications] = useState({
    emailNewApplicants: true,
    emailPayrollUpdates: true,
    emailLeaveRequests: true,
    emailPerformanceReviews: false,
    pushNewApplicants: false,
    pushPayrollUpdates: false,
  });

  const loginHistory = [
    { device: "Chrome on macOS", location: "Bangalore, IN", time: "2 hours ago", current: true },
    { device: "Safari on iPhone", location: "Bangalore, IN", time: "1 day ago", current: false },
  ]

  const handleSaveChanges = (type: 'Profile' | 'Notifications' | 'Password') => {
    // In a real app, you'd send this data to your API
    console.log(`Saving ${type} changes...`);
    toast({
      title: `${type} Settings Saved`,
      description: `Your ${type.toLowerCase()} changes have been saved successfully.`,
    });
  };

  const handleLogoutSession = (device: string) => {
    toast({
        title: "Session Logged Out",
        description: `Successfully logged out the session from ${device}.`
    })
  }

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4"/>Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
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
                <Input id="name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" value={profile.jobTitle} onChange={(e) => setProfile({...profile, jobTitle: e.target.value})} />
              </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => handleSaveChanges('Profile')}>Save Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
           <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password for enhanced security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => handleSaveChanges('Password')}>Update Password</Button>
            </CardFooter>
          </Card>
           <Card className="mt-6">
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Review recent login activity on your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loginHistory.map((session, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {session.device.includes('iPhone') ? <Smartphone className="h-6 w-6 text-muted-foreground" /> : <Monitor className="h-6 w-6 text-muted-foreground" />}
                            <div>
                                <p className="font-medium">{session.device} {session.current && <span className="text-green-500 text-sm">(current session)</span>}</p>
                                <p className="text-sm text-muted-foreground">{session.location} &middot; {session.time}</p>
                            </div>
                        </div>
                        {!session.current && <Button variant="ghost" size="sm" onClick={() => handleLogoutSession(session.device)}>Log out</Button>}
                    </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
           <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications. Choose your preferred channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-medium">By Email</h3>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="emailNewApplicants" className="flex flex-col gap-1">
                            <span>New Applicant Alerts</span>
                            <span className="font-normal text-muted-foreground text-xs">When a new candidate applies for a job you posted.</span>
                        </Label>
                        <Switch id="emailNewApplicants" checked={notifications.emailNewApplicants} onCheckedChange={(checked) => setNotifications({...notifications, emailNewApplicants: checked})}/>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="emailPayrollUpdates" className="flex flex-col gap-1">
                            <span>Payroll Updates</span>
                             <span className="font-normal text-muted-foreground text-xs">When payroll is processed or requires attention.</span>
                        </Label>
                        <Switch id="emailPayrollUpdates" checked={notifications.emailPayrollUpdates} onCheckedChange={(checked) => setNotifications({...notifications, emailPayrollUpdates: checked})}/>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="emailLeaveRequests" className="flex flex-col gap-1">
                            <span>Leave Requests</span>
                             <span className="font-normal text-muted-foreground text-xs">When a team member submits a leave request.</span>
                        </Label>
                        <Switch id="emailLeaveRequests" checked={notifications.emailLeaveRequests} onCheckedChange={(checked) => setNotifications({...notifications, emailLeaveRequests: checked})}/>
                    </div>
                </div>
                <Separator/>
                <div className="space-y-2">
                    <h3 className="font-medium">Push Notifications</h3>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="pushNewApplicants" className="flex flex-col gap-1">
                            <span>New Applicant Alerts</span>
                             <span className="font-normal text-muted-foreground text-xs">Real-time alerts on your mobile device.</span>
                        </Label>
                        <Switch id="pushNewApplicants" checked={notifications.pushNewApplicants} onCheckedChange={(checked) => setNotifications({...notifications, pushNewApplicants: checked})} disabled/>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="pushPayrollUpdates" className="flex flex-col gap-1">
                            <span>Payroll Updates</span>
                             <span className="font-normal text-muted-foreground text-xs">Instant updates on payroll status.</span>
                        </Label>
                        <Switch id="pushPayrollUpdates" checked={notifications.pushPayrollUpdates} onCheckedChange={(checked) => setNotifications({...notifications, pushPayrollUpdates: checked})} disabled/>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => handleSaveChanges('Notifications')}>Save Notifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
