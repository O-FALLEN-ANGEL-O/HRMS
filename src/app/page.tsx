
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { motion } from "framer-motion";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AnimatedLogo() {
  const iconVariants = {
    hidden: {
      pathLength: 0,
      fill: "rgba(168, 147, 224, 0)"
    },
    visible: {
      pathLength: 1,
      fill: "rgba(168, 147, 224, 1)"
    }
  }
  return (
    <div className="inline-flex items-center gap-3 font-headline text-3xl font-bold text-white">
        <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            strokeWidth="2" 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
        >
            <motion.path
                d="M12 2L2 7l10 5 10-5-10-5z"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                stroke="white"
                transition={{
                    default: { duration: 0.3, ease: "easeInOut" },
                    fill: { duration: 0.3, ease: [1, 0, 0.8, 1] }
                }}
            />
            <motion.path
                d="M2 17l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                stroke="white"
                transition={{
                    default: { duration: 0.3, ease: "easeInOut", delay: 0.1 },
                }}
            />
            <motion.path
                d="M2 12l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                stroke="white"
                transition={{
                    default: { duration: 0.3, ease: "easeInOut", delay: 0.2 },
                }}
            />
        </motion.svg>
        <span>OptiTalent</span>
    </div>
  );
}


export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // State for Admin/Manager login
    const [adminEmail, setAdminEmail] = useState('manager@optitalent.com');
    const [adminPassword, setAdminPassword] = useState('password');

    // State for Employee login
    const [employeeId, setEmployeeId] = useState('');
    const [employeePassword, setEmployeePassword] = useState('password123');

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await login(adminEmail, adminPassword);
        if (error) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message
            });
            setLoading(false);
        } else {
            // The onAuthStateChange listener in useAuth will handle the redirect
            toast({ title: 'Login Successful', description: `Redirecting...` });
        }
    };

    const handleEmployeeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const { data, error } = await login(employeeId, employeePassword, true);
        
        if (error) {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message
            });
            setLoading(false);
        } else {
            toast({ title: 'Login Successful', description: `Redirecting...` });
        }
    }


  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center bg-gradient-to-br from-[#A893E0] to-[#8A6FDF] p-10 text-white lg:flex">
         <div className="absolute inset-0 bg-black/20" />
         <div className="z-10 w-full max-w-md space-y-6">
            <AnimatedLogo />
            <h1 className="text-4xl font-bold font-headline leading-tight">The Future of HR is Here.</h1>
            <p className="text-lg text-white/80">One platform to manage your entire workforce, from hiring to retiring. Powered by AI, designed for humans.</p>
         </div>
         <div className="absolute bottom-6 z-10 text-center text-sm text-white/60">
            &copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.
         </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
          <Card className="w-full max-w-sm shadow-2xl border-none">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
              <CardDescription>Select your login method to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="employee">Employee</TabsTrigger>
                    <TabsTrigger value="admin">Admin / Manager</TabsTrigger>
                </TabsList>
                
                <TabsContent value="employee" className="pt-4">
                  <form onSubmit={handleEmployeeLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          placeholder="e.g., PEP0004"
                          required
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="employeePassword">Password</Label>
                          <Input
                              id="employeePassword"
                              type="password"
                              required
                              value={employeePassword}
                              onChange={e => setEmployeePassword(e.target.value)}
                          />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                      </Button>
                    </form>
                </TabsContent>

                <TabsContent value="admin" className="pt-4">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                              id="email" 
                              type="email" 
                              placeholder="m@example.com" 
                              required 
                              value={adminEmail}
                              onChange={e => setAdminEmail(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                              id="password" 
                              type="password" 
                              required 
                              value={adminPassword}
                              onChange={e => setAdminPassword(e.target.value)}
                          />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sign In
                      </Button>
                      <Button variant="outline" className="w-full" type="button" disabled={loading}>
                          Sign in with Google
                      </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
             <CardFooter className="flex flex-col items-center gap-4">
                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
