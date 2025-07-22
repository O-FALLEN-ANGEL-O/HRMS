

"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from 'next/link';
import { ArrowRight, ShieldQuestion } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockUsers } from '@/lib/mock-data/employees';
import { useMemo } from 'react';

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

export default function RoleSelectorPage() {
    const router = useRouter();

    const uniqueRoles = useMemo(() => {
        const roles = new Map<string, string>();
        mockUsers.forEach(user => {
            if (!roles.has(user.role)) {
                roles.set(user.role, user.profile.full_name);
            }
        });
        return Array.from(roles.entries()).map(([role, name]) => ({role, name}));
    }, []);


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
                <CardTitle className="flex items-center gap-2 font-headline text-3xl"><ShieldQuestion className="text-primary"/> Select a Role</CardTitle>
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
                            {uniqueRoles.map(account => (
                                <TableRow key={account.role}>
                                    <TableCell className="font-medium capitalize">{account.role.replace('-', ' ')}</TableCell>
                                    <TableCell className="text-muted-foreground">{account.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm"
                                            onClick={() => router.push(`/${account.role}/dashboard`)}
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
                This is a frontend prototype. All data is mocked.
            </div>
        </div>
      </div>
    </div>
  );
}
