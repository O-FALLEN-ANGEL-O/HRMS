
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Briefcase,
  CircleUser,
  Home,
  LogOut,
  Users,
  BarChart,
  FileQuestion,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Menu,
  FileText,
  CreditCard,
  PackagePlus,
  Settings,
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/recruitment", icon: Briefcase, label: "Recruitment" },
  { href: "/employees", icon: Users, label: "Employees" },
  { href: "/profile", icon: CircleUser, label: "Profile" },
  { href: "/leaves", icon: CalendarDays, label: "Leaves" },
  { href: "/performance", icon: BarChart, label: "Performance" },
  { href: "/onboarding", icon: PackagePlus, label: "Onboarding" },
  { href: "/payroll", icon: CreditCard, label: "Payroll" },
  { href: "/assessments", icon: FileText, label: "Assessments" },
  { href: "/helpdesk", icon: FileQuestion, label: "Helpdesk" },
  { href: "/company-feed", icon: Newspaper, label: "Company Feed" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role || params.role as string;

  const getBasePath = (path: string) => {
    const segments = path.split('/');
    return '/' + segments.slice(2).join('/');
  }
  const currentBasePath = getBasePath(pathname);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-20 bg-indigo-900 text-white flex flex-col items-center py-4 space-y-6">
      <div className="flex items-center justify-center h-12 w-12">
        <Logo className="text-white w-10 h-10" />
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center space-y-4 flex-grow">
          {navItems.map((item) => {
            const itemPath = item.href.startsWith('/') ? item.href : `/${item.href}`;
            const isActive = item.href === '/dashboard' 
              ? currentBasePath === '/dashboard'
              : currentBasePath.startsWith(itemPath) && item.href !== '/dashboard';
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={`/${role}${item.href}`} className={`p-3 rounded-lg hover:bg-indigo-700 transition-colors ${isActive ? 'bg-indigo-700' : ''}`}>
                      <item.icon className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="flex flex-col items-center space-y-6">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleLogout} variant="ghost" className="p-3 rounded-lg text-white hover:bg-indigo-700 hover:text-white transition-colors">
                        <LogOut className="h-6 w-6"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
            </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={`https://placehold.co/100x100?text=${(user?.profile?.name || user?.email || 'U').charAt(0)}`} alt="User avatar" data-ai-hint="person avatar" />
                    <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
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
        </div>
      </TooltipProvider>
    </aside>
  );
}

function AppHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Placeholder for future header content like breadcrumbs */}
      <div></div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        {/* Breadcrumbs can go here */}
      </div>
      <div></div>
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

  if (loading || !user) {
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
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
          <AppHeader />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
             {children}
          </div>
      </main>
    </div>
  );
}
