
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { MapPin, Calendar, Clock, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

const openRoles = [
    { title: "Chat Support Agent", description: "Provide top-notch support to customers via live chat." },
    { title: "Voice Support Specialist (English)", description: "Assist customers over the phone with their inquiries." },
    { title: "Voice Support Specialist (Kannada)", description: "Provide regional language support to our Kannada-speaking users." },
    { title: "Technical Support Engineer", description: "Troubleshoot and resolve technical issues for our products." },
];

function RegistrationForm() {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Registration Successful!",
            description: "We've received your registration for the walk-in drive. See you there!",
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button size="lg" className="px-12 py-6 text-lg">
                    Register Now
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register for Walk-in Drive</DialogTitle>
                    <DialogDescription>
                        Please fill out your details below. We look forward to meeting you!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegister}>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+91 12345 67890" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Desired Role</Label>
                             <Select name="role" required>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {openRoles.map(role => (
                                         <SelectItem key={role.title} value={role.title}>{role.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Submit Registration</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function WalkInDrivePage() {

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <Logo className="inline-flex" />
                    <h1 className="text-4xl font-bold font-headline tracking-tight">Walk-In Drive Registration</h1>
                    <p className="text-muted-foreground text-lg">
                        Join our team! We're looking for talented individuals to fill a variety of roles.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
                         <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Date</p>
                                <p className="text-muted-foreground">Saturday, August 24, 2024</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Time</p>
                                <p className="text-muted-foreground">9:00 AM - 4:00 PM</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Location</p>
                                <p className="text-muted-foreground">OptiTalent Towers, Bangalore</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Open Roles</CardTitle>
                        <CardDescription>We are hiring for the following positions. Select your desired role during registration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {openRoles.map((role, index) => (
                            <div key={index} className="p-4 border rounded-lg flex items-start gap-4">
                                <Briefcase className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">{role.title}</h3>
                                    <p className="text-sm text-muted-foreground">{role.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="text-center">
                    <RegistrationForm />
                </div>
                 <footer className="text-center text-sm text-muted-foreground pt-8">
                    &copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
}
