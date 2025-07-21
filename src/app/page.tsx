

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loginWithEmployeeId, verifyOtp } from './actions';
import type { User } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    { role: 'Admin', user: 'PEP0001', pass: 'password' },
    { role: 'HR', user: 'PEP0002', pass: 'password' },
    { role: 'Manager', user: 'PEP0003', pass: 'password' },
    { role: 'Recruiter', user: 'PEP0004', pass: 'password' },
    { role: 'QA Analyst', user: 'PEP0005', pass: 'password' },
    { role: 'Process Manager', user: 'PEP0006', pass: 'password' },
    { role: 'Team Leader', user: 'PEP0007', pass: 'password' },
    { role: 'Marketing', user: 'PEP0008', pass: 'password' },
    { role: 'Finance', user: 'PEP0009', pass: 'password' },
    { role: 'IT Manager', user: 'PEP0010', pass: 'password' },
    { role: 'Ops Manager', user: 'PEP0011', pass: 'password' },
    { role: 'Employee', user: 'PEP0012', pass: 'password123' },
];

export default function LoginPage() {
    const router = useRouter();
    const { user, loading: authLoading, revalidateUser } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // 'password' | 'otp'
    const [loginStep, setLoginStep] = useState('password'); 
    const [tempUser, setTempUser] = useState<User | null>(null);

    // State for Employee login
    const [employeeId, setEmployeeId] = useState('PEP0001');
    const [employeePassword, setEmployeePassword] = useState('password');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            router.push(`/${user.role}/dashboard`);
        }
    }, [user, authLoading, router]);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await loginWithEmployeeId({
          employeeId: employeeId,
          password: employeePassword
        });
        
        if (result.error || !result.user) {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: result.error || "An unknown error occurred."
            });
            setLoading(false);
        } else {
            setTempUser(result.user);
            setLoginStep('otp');
            toast({
                title: 'OTP Required',
                description: `An OTP has been sent to ${result.user.email}. Please check your inbox.`,
                duration: 10000,
            });
            setLoading(false);
        }
    }

     const handleOtpVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tempUser) return;

        setLoading(true);
        
        const result = await verifyOtp({ email: tempUser.email, otp });

        if (result.success) {
            await revalidateUser();
            toast({ title: 'Verification Successful!', description: 'Redirecting to your dashboard.' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: result.error || 'The OTP you entered is incorrect.',
            });
            setLoading(false);
        }
    };


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
              <CardTitle className="font-headline text-3xl">
                {loginStep === 'password' ? 'Welcome Back' : 'Verify Your Identity'}
                </CardTitle>
              <CardDescription>
                {loginStep === 'password' ? 'Enter your employee credentials to sign in.' : `An OTP has been sent to the email address of ${tempUser?.profile?.full_name}.`}
                </CardDescription>
            </CardHeader>
            <CardContent>
              {loginStep === 'password' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                        id="employeeId"
                        placeholder="e.g., PEP0001"
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
              ) : (
                <form onSubmit={handleOtpVerification} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input
                        id="otp"
                        placeholder="Enter 6-digit code from email"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Sign In'}
                    </Button>
                    <Button variant="link" size="sm" className="w-full" onClick={() => setLoginStep('password')}>
                        Back to password login
                    </Button>
                </form>
              )}
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
                 <ScrollArea className="h-64">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Employee ID</TableHead>
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
                </ScrollArea>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
