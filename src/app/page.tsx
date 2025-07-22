

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { motion } from "framer-motion";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldQuestion, UserCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockUsers } from '@/lib/mock-data/employees';

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
    const { login, user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            router.push(`/${user.role}/dashboard`);
        }
    }, [user, authLoading, router]);

    const handleLogin = async (employeeId: string) => {
        setLoading(employeeId);

        const { error } = await login(employeeId);
        
        if (error) {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || "An unknown error occurred."
            });
            setLoading(null);
        } else {
            toast({ title: 'Login Successful!', description: 'Redirecting to your dashboard...' });
        }
    }

  if (authLoading) {
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
        <div className="w-full max-w-2xl space-y-6">
           <Card className="w-full shadow-2xl border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-3xl"><ShieldQuestion className="text-primary"/> Quick Login</CardTitle>
                <CardDescription>Click any user to instantly log in and explore their role-based dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map(account => (
                                <TableRow key={account.profile.employee_id}>
                                    <TableCell className="font-medium">{account.profile.role}</TableCell>
                                    <TableCell>{account.profile.employee_id}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm"
                                            onClick={() => handleLogin(account.profile.employee_id)}
                                            disabled={loading !== null}
                                        >
                                            {loading === account.profile.employee_id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserCheck className="mr-2 h-4 w-4" />
                                            )}
                                            Login
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
           </Card>
            <div className="text-center text-sm">
                Need to create a new account?{" "}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
