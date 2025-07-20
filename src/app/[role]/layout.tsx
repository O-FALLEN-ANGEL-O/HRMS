
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  Briefcase,
  CircleUser,
  CreditCard,
  Home,
  LogOut,
  PackagePlus,
  Settings,
  Users,
  BarChart,
  FileQuestion,
  GraduationCap,
  Newspaper,
  CalendarDays,
  User,
  Menu,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/recruitment", icon: Briefcase, label: "Recruitment" },
  { href: "/onboarding", icon: PackagePlus, label: "Onboarding" },
  { href: "/employees", icon: Users, label: "Employees" },
  { href: "/payroll", icon: CreditCard, label: "Payroll" },
  { href: "/performance", icon: BarChart, label: "Performance" },
  { href: "/leaves", icon: CalendarDays, label: "Leaves" },
  { href: "/helpdesk", icon: FileQuestion, label: "Helpdesk" },
  { href: "/assessments", icon: GraduationCap, label: "Assessments" },
  { href: "/company-feed", icon: Newspaper, label: "Company Feed" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];


function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const role = params.role as string;
  
  const getBasePath = (path: string) => {
    const segments = path.split('/');
    // Assumes URL structure is /[role]/[page]
    // e.g., /admin/dashboard -> /dashboard
    // e.g., /employee/leaves -> /leaves
    return '/' + segments.slice(2).join('/');
  }
  const currentBasePath = getBasePath(pathname);
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 flex items-center gap-2">
        <Logo className="text-sidebar-foreground w-8 h-8" />
        <span className="font-headline text-2xl group-data-[collapsible=icon]:hidden">OptiTalent</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const itemPath = item.href.startsWith('/') ? item.href : `/${item.href}`;
             // Special case for dashboard
            const isActive = currentBasePath === '/dashboard' && item.href === '/dashboard'
                ? true
                : item.href !== '/dashboard' && currentBasePath.startsWith(itemPath);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label }}
                >
                  <Link href={`/${role}${item.href}`}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || params.role as string;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <div className="md:hidden">
        <SidebarTrigger asChild>
            <Button variant="outline" size="icon"><Menu/></Button>
        </SidebarTrigger>
      </div>
      <div className="w-full flex-1">
         {/* Can add breadcrumbs or page title here */}
      </div>
       <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://placehold.co/100x100?text=${(user?.profile?.name || user?.email || 'U').charAt(0)}`} alt="User avatar" data-ai-hint="person avatar" />
                        <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuLabel>
                    <p className="font-semibold">{user?.profile?.name || user?.email}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${role}/profile`)}>
                    <CircleUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${role}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    // Redirect if role in URL doesn't match user's role
    if (!loading && user && params.role !== user.role) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, loading, router, params]);

  // Fallback for when params.role is not available on initial render
  const role = user?.role || params.role;

  if (loading || !role) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p>Loading...</p>
        </div>
    )
  }
  
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
