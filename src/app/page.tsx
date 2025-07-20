
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.24 10.28c0.28-0.22 0.53-0.44 0.79-0.68.26-0.24 0.52-0.49 0.78-0.73s0.51-0.48 0.75-0.73c0.24-0.25 0.48-0.5 0.7-0.76 0.22-0.26 0.43-0.52 0.62-0.79 0.19-0.27 0.36-0.55 0.51-0.84 0.15-0.29 0.28-0.59 0.4-0.89 0.12-0.3 0.22-0.61 0.3-0.92s0.14-0.62 0.19-0.94l0.06-0.34H12v4.51h6.16c-0.23 1.4-0.9 2.65-1.95 3.48s-2.39 1.25-4.21 1.25c-2.45 0-4.63-0.99-6.22-2.58s-2.38-3.77-2.38-6.22 0.79-4.63 2.38-6.22 3.77-2.38 6.22-2.38c1.55 0 2.98 0.49 4.15 1.45l3.25-3.25C17.43 1.47 15.02 0.48 12 0.48c-3.29 0-6.22 1.34-8.31 3.71S0 9.25 0 12.5s1.59 6.04 4.2 8.31 5.56 3.19 8.8 3.19c2.89 0 5.48-0.95 7.4-2.86s2.9-4.49 2.9-7.56c0-0.76-0.07-1.5-0.2-2.24h-9.9z" transform="translate(0 -0.48)" fill="#4285F4" />
    </svg>
  );
}

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11.23 11.23H1.5V1.5H11.23V11.23Z" fill="#F25022"/>
      <path d="M22.5 11.23H12.77V1.5H22.5V11.23Z" fill="#7FBA00"/>
      <path d="M11.23 22.5H1.5V12.77H11.23V22.5Z" fill="#00A4EF"/>
      <path d="M22.5 22.5H12.77V12.77H22.5V22.5Z" fill="#FFB900"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const adminEmailRef = React.useRef<HTMLInputElement>(null);
  const employeeIdRef = React.useRef<HTMLInputElement>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(adminEmailRef.current?.value) {
      login({email: adminEmailRef.current.value, role: 'admin' });
      router.push(`/admin/dashboard`);
    }
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(employeeIdRef.current?.value) {
      // In a real app, you'd check if the employee ID is new or existing.
      // Here, we'll simulate it for demo purposes.
      login({email: `${employeeIdRef.current.value}@optitalent.com`, role: 'employee', employeeId: employeeIdRef.current.value });
      router.push(`/employee/dashboard`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome to OptiTalent</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employee" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employee">Employee</TabsTrigger>
              <TabsTrigger value="admin">Admin / Manager</TabsTrigger>
            </TabsList>
            <TabsContent value="employee" className="space-y-4">
               <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Sign in with your Employee ID</span>
                </div>
              </div>
              <form onSubmit={handleEmployeeLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input ref={employeeIdRef} id="employeeId" placeholder="e.g., OPT-12345" required defaultValue="EMP-007" />
                </div>
                {/* Logic for password can be added here based on whether user is new or existing */}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Continue
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="admin" className="space-y-4">
              <div className="relative mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with SSO</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                    <Button variant="outline" className="w-full">
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Google
                    </Button>
                    <Button variant="outline" className="w-full">
                        <MicrosoftIcon className="mr-2 h-5 w-5" />
                        Microsoft
                    </Button>
                </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input ref={adminEmailRef} id="adminEmail" type="email" placeholder="name@company.com" required defaultValue="admin@optitalent.com"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input id="adminPassword" type="password" required defaultValue="password" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign In
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-primary">Terms of Service</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
