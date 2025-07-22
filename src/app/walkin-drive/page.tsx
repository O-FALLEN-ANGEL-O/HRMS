
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { MapPin, Calendar, Clock, Briefcase } from "lucide-react";
import Link from "next/link";


const openRoles = [
    { title: "Chat Support Agent", description: "Provide top-notch support to customers via live chat." },
    { title: "Voice Support Specialist (English)", description: "Assist customers over the phone with their inquiries." },
    { title: "Voice Support Specialist (Kannada)", description: "Provide regional language support to our Kannada-speaking users." },
    { title: "Technical Support Engineer", description: "Troubleshoot and resolve technical issues for our products." },
];


export default function WalkInDrivePage() {

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <Logo className="inline-flex" showText={true} />
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
                        <CardDescription>We are hiring for the following positions. Register now to apply.</CardDescription>
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
                   <Button asChild size="lg" className="px-12 py-6 text-lg">
                        <Link href="/walkin-drive/register">
                            Register Now
                        </Link>
                    </Button>
                </div>
                 <footer className="text-center text-sm text-muted-foreground pt-8">
                    &copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
}
