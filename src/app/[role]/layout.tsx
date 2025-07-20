
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Briefcase, CircleUser, Home, LogOut, Users, BarChart, FileQuestion,
  Newspaper, CalendarDays, Menu, FileText, CreditCard,
  PackagePlus, Settings
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import {
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Bell } from 'lucide-react';

const allNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'employee', 'manager', 'hr'] },
  { href: '/recruitment', icon: Briefcase, label: 'Recruitment', roles: ['admin', 'hr'] },
  { href: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'hr'] },
  { href: '/leaves', icon: CalendarDays, label: 'Leaves', roles: ['admin', 'employee', 'manager', 'hr'] },
  { href: '/performance', icon: BarChart, label: 'Performance', roles: ['admin', 'manager', 'hr'] },
  { href: '/onboarding', icon: PackagePlus, label: 'Onboarding', roles: ['admin', 'hr'] },
  { href: '/payroll', icon: CreditCard, label: 'Payroll', roles: ['admin'] },
  { href: '/assessments', icon: FileText, label: 'Assessments', roles: ['admin', 'employee', 'manager'] },
  { href: '/helpdesk', icon: FileQuestion, label: 'Helpdesk', roles: ['admin', 'employee'] },
  { href: '/company-feed', icon: Newspaper, label: 'Company Feed', roles: ['admin', 'employee', 'manager', 'hr'] },
];

const notifications = [
    { id: 1, icon: Users, text: "New applicant for 'Software Engineer'", time: '2m ago' },
    { id: 2, icon: CalendarDays, text: "Your leave request has been approved", time: '1h ago' },
    { id: 3, icon: CreditCard, text: "Payroll for July has been processed", time: '5h ago' },
];

function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const role = user?.role || (params.role as string) || 'employee';

  const [isExpanded, setIsExpanded] = React.useState(false);

  const getBasePath = (path: string) => '/' + path.split('/').slice(2).join('/');
  const currentBasePath = getBasePath(pathname);

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  const SidebarNav = () => (
    <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-start mt-6 space-y-2 w-full px-2 flex-grow">
            {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
                ? currentBasePath === '/dashboard' || currentBasePath === ''
                : currentBasePath.startsWith(item.href) && item.href !== '/dashboard';

            return (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                        <Link
                            href={`/${role}${item.href}`}
                            className={`flex items-center w-full gap-4 px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors ${isActive ? 'bg-primary/80' : ''}`}
                        >
                            <item.icon className="h-5 w-5" />
                            {(isExpanded) && <span className="text-sm">{item.label}</span>}
                        </Link>
                    </TooltipTrigger>
                    {!isExpanded && (
                        <TooltipContent side="right">
                        <p>{item.label}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            );
            })}
        </nav>
    </TooltipProvider>
  )
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          hidden md:flex flex-col fixed top-0 left-0 z-50 h-full bg-slate-900 text-slate-200 transition-all duration-300
          ${isExpanded ? 'w-56' : 'w-20'}
        `}
      >
        <div className="flex items-center justify-center h-16 w-full px-4 shrink-0">
          <Logo className="text-white w-10 h-10" />
          {isExpanded && <span className="ml-2 font-bold text-white">OptiTalent</span>}
        </div>
        <SidebarNav/>
      </aside>
    </>
  );
}

function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || (params.role as string) || 'employee';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between md:justify-end gap-4">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-slate-900 text-slate-200 border-none">
                 <div className="flex items-center justify-center h-16 w-full px-4 shrink-0">
                    <Logo className="text-white w-10 h-10" />
                    <span className="ml-2 font-bold text-white">OptiTalent</span>
                </div>
                 <nav className="flex flex-col items-start mt-6 space-y-2 w-full px-2 flex-grow">
                    {allNavItems.filter(i => i.roles.includes(role)).map(item => (
                        <Link
                            key={item.href}
                            href={`/${role}${item.href}`}
                            className={`flex items-center w-full gap-4 px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}
                 </nav>
            </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Notifications</SheetTitle>
                        <SheetDescription>You have {notifications.length} unread notifications.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                        {notifications.map(n => {
                            const Icon = n.icon;
                            return (
                                <div key={n.id} className="flex items-start gap-3">
                                    <div className="p-2 bg-muted rounded-full">
                                        <Icon className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{n.text}</p>
                                        <p className="text-xs text-muted-foreground">{n.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 text-left">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage
                        src={`https://placehold.co/100x100?text=${(user?.profile?.name || user?.email || 'U').charAt(0)}`}
                        alt="User avatar" data-ai-hint="person avatar"
                      />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="hidden md:block">
                        <p className="font-semibold text-sm truncate">{user?.profile?.name || user?.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                    </div>
                </button>
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
        </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    // Redirect if role in URL doesn't match authenticated user's role
    if (!loading && user && params.role !== user.role) {
      const pagePath = pathname.split('/').slice(2).join('/');
      if (pagePath) {
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
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col md:ml-20">
         <AppHeader/>
         <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
