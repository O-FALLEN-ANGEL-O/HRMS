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
  LifeBuoy,
  LogOut,
  PackagePlus,
  Search,
  Settings,
  Users,
  BarChart,
  FileQuestion,
  GraduationCap,
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';

const adminNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/recruitment", icon: Briefcase, label: "Recruitment" },
  { href: "/onboarding", icon: PackagePlus, label: "Onboarding" },
  { href: "/employees", icon: Users, label: "Employees" },
  { href: "/payroll", icon: CreditCard, label: "Payroll" },
  { href: "/performance", icon: BarChart, label: "Performance" },
  { href: "/helpdesk", icon: FileQuestion, label: "Helpdesk" },
  { href: "/assessments", icon: GraduationCap, label: "Assessments" },
];

const employeeNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/helpdesk", icon: FileQuestion, label: "My Tickets" },
  { href: "/assessments", icon: GraduationCap, label: "Assessments" },
]

function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const navItems = role === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const itemPath = `/${role}${item.href}`;
            const baseItemPath = itemPath.split('/')[2];
            const currentBasePath = pathname.split('/')[2];

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={baseItemPath === currentBasePath}
                  tooltip={{ children: item.label }}
                >
                  <Link href={itemPath}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/${role}/settings`}
              tooltip={{ children: 'Settings' }}
            >
              <Link href={`/${role}/settings`}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Support' }}
            >
              <Link href="#">
                <LifeBuoy />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role || 'employee';

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="h-8 w-8" />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search features, employees..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/100x100" alt="@shadcn" data-ai-hint="person avatar" />
              <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user ? user.email : 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/${role}/settings`)}>
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
  }, [user, loading, router, params.role]);
  
  if (loading || !user) {
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
