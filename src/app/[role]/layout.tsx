
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
  Newspaper,
  CalendarDays,
  LayoutGrid,
  Bot,
  TrendingUp,
  FileCheck,
  ChevronDown,
  User,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const adminNavItems = [
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
];

const employeeNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/company-feed", icon: Newspaper, label: "Company Feed" },
  { href: "/leaves", icon: CalendarDays, label: "My Leaves" },
  { href: "/helpdesk", icon: FileQuestion, label: "My Tickets" },
  { href: "/assessments", icon: GraduationCap, label: "Assessments" },
]

function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role || params.role as string;
  const [isAiToolsOpen, setIsAiToolsOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = role === 'admin' ? adminNavItems : employeeNavItems;
  
  const getBasePath = (path: string) => {
    return `/${path.split('/')[1]}/${path.split('/')[2]}`;
  }
  const currentBasePath = getBasePath(pathname);
  
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-4 justify-between">
        <Logo className="text-sidebar-foreground" />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const itemPath = `/${role}${item.href}`;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={currentBasePath === itemPath}
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
           {role === 'admin' && (
             <Collapsible open={isAiToolsOpen} onOpenChange={setIsAiToolsOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className="justify-between group/button"
                        >
                        <div className="flex items-center gap-2">
                            <Bot />
                            <span>AI Tools</span>
                        </div>
                        <ChevronDown className={cn("transition-transform duration-200 group-data-[collapsible=icon]/sidebar-wrapper:hidden", isAiToolsOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                    <div className="pl-8 flex flex-col gap-1 py-1">
                        <Link href="#" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground">Review Analyzer</Link>
                        <Link href="#" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground">HR Chatbot</Link>
                        <Link href="#" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground">Leave Spike Predictor</Link>
                    </div>
                </CollapsibleContent>
             </Collapsible>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-md w-full hover:bg-sidebar-accent/10">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100" alt="@shadcn" data-ai-hint="person avatar" />
                        <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                     <span className="text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        {user?.profile?.name || user?.email}
                     </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="mb-2">
                <DropdownMenuLabel>{user ? user.email : 'My Account'}</DropdownMenuLabel>
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

        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <SidebarTrigger className="h-8 w-8" />
      </div>
      <div className="w-full flex-1">
        {/* Header content can go here if needed, like breadcrumbs */}
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
       <Button variant="ghost" size="icon" className="rounded-full">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
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
