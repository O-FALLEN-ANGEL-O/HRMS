
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, ShieldQuestion } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo, useState, useEffect, memo } from 'react';
import { mockUsers } from '@/lib/mock-data/employees';
import { navConfig } from '@/hooks/use-nav';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LoadingLogo } from '@/components/loading-logo';
import { Logo } from '@/components/logo';

export default function RoleSelectorPage() {
    const { login, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const allRoles = useMemo(() => {
        return Object.keys(navConfig)
            .filter(role => role !== 'guest')
            .map(role => {
                const userForRole = mockUsers.find(u => u.role === role);
                return {
                    role,
                    name: userForRole ? userForRole.profile.full_name : 'Default ' + role.charAt(0).toUpperCase() + role.slice(1),
                    employeeId: userForRole ? userForRole.profile.employee_id : ''
                }
            });
    }, []);

    const handleLogin = async (employeeId: string) => {
        if (!employeeId) {
            toast({
                title: "Login Error",
                description: "This role does not have a valid Employee ID to log in with.",
                variant: "destructive",
            });
            return;
        }
        const { error } = await login(employeeId);
        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };
    
    if (authLoading || isInitialLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingLogo />
            </div>
        )
    }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
            <Logo className="inline-flex text-3xl mb-2" showText={true} />
            <h1 className="text-4xl font-bold font-headline leading-tight text-foreground">The Future of HR is Here.</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">One platform to manage your entire workforce, from hiring to retiring. Powered by AI, designed for humans.</p>
        </div>

        <Card className="w-full shadow-lg border">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl"><ShieldQuestion className="text-primary"/> Select a Role to Demo</CardTitle>
            <CardDescription>Click any role to directly access its role-based dashboard and features.</CardDescription>
        </CardHeader>
        <CardContent>
                <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Example User</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allRoles.map(account => (
                            <TableRow key={account.role}>
                                <TableCell className="font-medium capitalize">{account.role.replace(/-/g, ' ')}</TableCell>
                                <TableCell className="text-muted-foreground">{account.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="sm"
                                        disabled={authLoading}
                                        onClick={() => handleLogin(account.employeeId)}
                                    >
                                        View Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
        </Card>
        <div className="text-center text-sm text-muted-foreground">
             &copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved. This is a frontend prototype.
        </div>
      </div>
    </div>
  );
}
