
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
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Separator } from '@/components/ui/separator';

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
  { href: "/settings", icon: Settings, label: "Settings" },
];

const employeeNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/profile", icon: User, label: "My Profile" },
    { href: "/leaves", icon: CalendarDays, label: "My Leaves" },
    { href: "/assessments", icon: GraduationCap, label: "My Assessments" },
    { href: "/company-feed", icon: Newspaper, label: "Company Feed" },
    { href: "/helpdesk", icon: FileQuestion, label: "Helpdesk" },
    { href: "/settings", icon: Settings, label: "Settings" },
];


function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const role = user?.role || params.role as string;

  const navItems = role === 'admin' ? adminNavItems : employeeNavItems;
  
  const getBasePath = (path: string) => {
    const segments = path.split('/');
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
            const isActive = item.href === '/dashboard' 
                ? currentBasePath === '/dashboard'
                : currentBasePath.startsWith(itemPath) && item.href !== '/dashboard';

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
         {/* Footer content can be added here later */}
      </SidebarFooter>
    </Sidebar>
  );
}

const notifications = [
    {
        icon: FileText,
        title: "New applicant assigned",
        description: "John Doe has been assigned to you for the Software Engineer role.",
        time: "5m ago",
        read: false
    },
    {
        icon: CalendarDays,
        title: "Leave request approved",
        description: "Your leave request for Dec 25th has been approved.",
        time: "1h ago",
        read: false
    },
    {
        icon: DollarSign,
        title: "Payroll processed",
        description: "July's payroll has been successfully processed and disbursed.",
        time: "1d ago",
        read: true
    },
    {
        icon: AlertCircle,
        title: "Urgent: IT Ticket #4452",
        description: "Server room temperature is critical. Immediate action required.",
        time: "2d ago",
        read: true
    }
];

function NotificationPanel() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Toggle notifications</span>
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary/80"></span>
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                    <div className="space-y-4">
                        {notifications.map((item, index) => {
                           const Icon = item.icon
                           return (
                               <div key={index} className="flex items-start gap-4">
                                   <div className={`mt-1 p-2 rounded-full ${!item.read ? 'bg-primary/10' : 'bg-muted'}`}>
                                       <Icon className={`h-5 w-5 ${!item.read ? 'text-primary' : 'text-muted-foreground'}`} />
                                   </div>
                                   <div className="flex-1">
                                       <p className={`font-medium ${!item.read ? 'font-semibold' : ''}`}>{item.title}</p>
                                       <p className="text-sm text-muted-foreground">{item.description}</p>
                                       <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                                   </div>
                                    {!item.read && <div className="mt-1 h-2 w-2 rounded-full bg-primary"/>}
                               </div>
                           )
                        })}
                    </div>
                </div>
                <Separator/>
                <div className="text-center">
                    <Button variant="ghost" size="sm">Mark all as read</Button>
                </div>
            </SheetContent>
        </Sheet>
    )
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
       <NotificationPanel />
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
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    // Redirect if role in URL doesn't match user's role
    if (!loading && user && params.role !== user.role) {
      // Preserve the current page if it's not the dashboard
      const pagePath = pathname.split('/').slice(2).join('/');
      if (pagePath && pagePath !== 'dashboard') {
         router.push(`/${user.role}/${pagePath}`);
      } else {
         router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router, params, pathname]);

  // Fallback for when params.role is not available on initial render
  const role = user?.role || params.role;

  if (loading || !role) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex items-center gap-2">
                <Logo />
                <span>Loading...</span>
            </div>
        </div>
    )
  }
  
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-[#F5F5F5] dark:bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
