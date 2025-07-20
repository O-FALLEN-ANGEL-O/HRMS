"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { useAuth } from '@/hooks/use-auth';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion";

function EmployeeLoginFlow() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState("EMP-007");
  const [password, setPassword] = useState("password");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId === "EMP-007") {
      setIsNewUser(false);
    } else {
      setIsNewUser(true);
      setPassword('');
    }
    setStep(2);
  };
  
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isNewUser && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please re-enter your passwords.",
        variant: "destructive",
      });
      return;
    }
    
    login({ email: `${employeeId}@optitalent.com`, role: 'employee', employeeId, isNew: isNewUser });
    router.push('/employee/dashboard');
  };
  
  const handleBack = () => {
    setStep(1);
    setPassword("password");
    setConfirmPassword("");
  }
  
  return (
     <form onSubmit={step === 1 ? handleIdSubmit : handleFinalSubmit} className="space-y-4 pt-4">
        {step === 2 && (
             <Button variant="link" onClick={handleBack} className="p-0 h-auto text-muted-foreground hover:text-primary">← Back</Button>
        )}
        <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input 
                id="employeeId" 
                placeholder="e.g., OPT-12345" 
                required 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={step === 2}
            />
        </div>

        {step === 2 && (
            isNewUser ? (
                <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Create Password</Label>
                      <Input id="newPassword" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </div>
                </>
            ) : (
                 <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            )
        )}
        
        <Button type="submit" className="w-full">
            {step === 1 ? 'Continue' : 'Sign In'}
        </Button>
      </form>
  )
}

function AdminLoginFlow() {
  const router = useRouter();
  const { login } = useAuth();
  const adminEmailRef = React.useRef<HTMLInputElement>(null);
  
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmailRef.current?.value) {
      login({ email: adminEmailRef.current.value, role: 'admin' });
      router.push(`/admin/dashboard`);
    }
  };

  return (
    <div className="space-y-4 pt-4">
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email Address</Label>
            <Input ref={adminEmailRef} id="adminEmail" type="email" placeholder="name@company.com" required defaultValue="admin@optitalent.com"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminPassword">Password</Label>
            <Input id="adminPassword" type="password" required defaultValue="password" />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
    </div>
  )
}

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
                    default: { duration: 1.5, ease: "easeInOut" },
                    fill: { duration: 1.5, ease: [1, 0, 0.8, 1] }
                }}
            />
            <motion.path
                d="M2 17l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                stroke="white"
                transition={{
                    default: { duration: 1.5, ease: "easeInOut", delay: 0.5 },
                }}
            />
            <motion.path
                d="M2 12l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                stroke="white"
                transition={{
                    default: { duration: 1.5, ease: "easeInOut", delay: 1.0 },
                }}
            />
        </motion.svg>
        <span>OptiTalent</span>
    </div>
  );
}

export default function LoginPage() {
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
          <Card className="w-full max-w-md shadow-2xl border-none">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
              <CardDescription>Select your role to sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="employee">Employee</TabsTrigger>
                  <TabsTrigger value="admin">Admin / Manager</TabsTrigger>
                </TabsList>
                <TabsContent value="employee">
                  <EmployeeLoginFlow />
                </TabsContent>
                <TabsContent value="admin">
                  <AdminLoginFlow />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-xs text-muted-foreground pt-4">
              <p>
                Need help? Contact{' '}
                <a href="#" className="underline hover:text-primary">Support</a>.
              </p>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
