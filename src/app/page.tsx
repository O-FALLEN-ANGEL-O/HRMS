
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { motion } from "framer-motion";
import { Briefcase, User, Shield, UserCog, Star, Settings2, BarChart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

const ROLES: { name: string, value: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager', icon: LucideIcon }[] = [
    { name: "Admin", value: "admin", icon: Shield },
    { name: "Manager", value: "manager", icon: UserCog },
    { name: "HR", value: "hr", icon: BarChart },
    { name: "Recruiter", value: "recruiter", icon: Briefcase },
    { name: "Employee", value: "employee", icon: User },
    { name: "QA Analyst", value: "qa-analyst", icon: Star },
    { name: "Process Manager", value: "process-manager", icon: Settings2 },
];


export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const handleRoleSelect = (role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager') => {
        const userEmail = `${role}@optitalent.com`;
        const profile = { name: role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ') };
        login({ email: userEmail, role, profile });
        router.push(`/${role}/dashboard`);
    };

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
              <CardTitle className="font-headline text-3xl">Select Your Role</CardTitle>
              <CardDescription>Choose a user role to explore the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                            <Button 
                                key={role.value} 
                                variant="outline" 
                                className="h-20 flex-col gap-2 text-base"
                                onClick={() => handleRoleSelect(role.value)}
                            >
                                <Icon className="h-6 w-6 text-primary" />
                                {role.name}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
