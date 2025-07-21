

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { motion } from "framer-motion";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldQuestion } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loginWithEmployeeId } from './actions';

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

const demoAccounts = [
    { role: 'Admin', user: 'admin@optitalent.com', pass: 'password' },
    { role: 'HR', user: 'hr@optitalent.com', pass: 'password' },
    { role: 'Manager', user: 'manager@optitalent.com', pass: 'password' },
    { role: 'Recruiter', user: 'recruiter@optitalent.com', pass: 'password' },
    { role: 'QA Analyst', user: 'qa-analyst@optitalent.com', pass: 'password' },
    { role: 'Process Manager', user: 'process-manager@optitalent.com', pass: 'password' },
    { role: 'Team Leader', user: 'team-leader@optitalent.com', pass: 'password' },
    { role: 'Marketing', user: 'marketing@optitalent.com', pass: 'password' },
    { role: 'Finance', user: 'finance@optitalent.com', pass: 'password' },
    { role: 'IT Manager', user: 'it-manager@optitalent.com', pass: 'password' },
    { role: 'Ops Manager', user: 'operations-manager@optitalent.com', pass: 'password' },
    { role: 'Employee', user: 'PEP0012', pass: 'password123' },
];

export default function LoginPage() {
    const router = useRouter();
    const { login, user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // State for Admin/Manager login
    const [adminEmail, setAdminEmail] = useState('manager@optitalent.com');
    const [adminPassword, setAdminPassword] = useState('password');

    // State for Employee login
    const [employeeId, setEmployeeId] = useState('PEP0012');
    const [employeePassword, setEmployeePassword] = useState('password123');

    useEffect(() => {
        // If the auth state is no longer loading and a user object exists, redirect them.
        if (!authLoading && user) {
            router.push(`/${user.role}/dashboard`);
        }
    }, [user, authLoading, router]);

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
        
        const result = await loginWithEmployeeId({
          employeeId: employeeId,
          password: employeePassword
        });
        
        if (result.error) {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: result.error
            });
            setLoading(false);
        } else {
            toast({ title: 'Login Successful', description: `Redirecting...` });
            // onAuthStateChange will handle the redirect
        }
    }

  // Show a loading state if auth is still resolving and there's no user yet
  if (authLoading || user) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
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
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-background min-h-screen">
        <div className="w-full max-w-sm space-y-6">
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

           <Card className="w-full max-w-sm shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldQuestion className="text-primary"/> Demo Accounts</CardTitle>
                <CardDescription>Use these credentials to explore different roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Password</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {demoAccounts.map(account => (
                            <TableRow key={account.role}>
                                <TableCell className="font-medium">{account.role}</TableCell>
                                <TableCell>{account.user}</TableCell>
                                <TableCell>{account.pass}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
