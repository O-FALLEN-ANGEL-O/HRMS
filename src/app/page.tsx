
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, ShieldQuestion } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AnimatedBot } from '@/components/ui/animated-bot';
import { LoadingLogo } from '@/components/loading-logo';
import { Logo } from '@/components/logo';


export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await login(identifier, password);
        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };
    
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="relative hidden flex-col items-center justify-between bg-gradient-to-br from-primary via-primary/80 to-secondary p-8 text-white lg:flex">
                <div className="absolute inset-0 bg-black/40 z-0"></div>
                <div className="z-10 w-full max-w-md">
                    <Logo className="text-white" showText={true} />
                    <div className="mt-8 space-y-4">
                        <h1 className="text-4xl font-bold font-headline leading-tight">Meet Your AI HR Companion</h1>
                        <p className="text-lg text-primary-foreground/80">
                            Automate tasks, get instant answers, and focus on what matters most - your people.
                        </p>
                    </div>
                </div>

                <div className="z-10 flex flex-col items-center text-center">
                   <AnimatedBot className="text-white" size={120} />
                    <p className="mt-4 text-2xl font-semibold">HURRY UP! LOG IN &</p>
                    <p className="text-2xl font-semibold">START USING NOW</p>
                </div>

                 <p className="z-10 text-xs text-primary-foreground/60">&copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.</p>
            </div>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                     <div className="lg:hidden text-center">
                        <Logo className="inline-flex mb-2" showText={true} />
                    </div>
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
                            <CardDescription>Sign in to your OptiTalent account to continue.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier">Employee ID or Email</Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="e.g., PEP0012 or you@example.com"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-4">
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                                 <div className="text-center text-sm">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/signup" className="underline font-medium hover:text-primary">
                                        Sign up
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>

                    <Button variant="outline" className="w-full" onClick={() => router.push('/role-selector')}>
                        <ShieldQuestion className="mr-2 h-4 w-4" /> Demo Role Selector
                    </Button>
                </div>
            </div>
        </div>
    );
}

    