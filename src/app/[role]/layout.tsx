// Updated Responsive Sidebar with:
// - Animated toggle on hover/click
// - Adaptive mobile drawer
// - Role-specific filtered nav
// - Lucide icons

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Briefcase, CircleUser, Home, LogOut, Users, BarChart, FileQuestion,
  GraduationCap, Newspaper, CalendarDays, Menu, FileText, CreditCard,
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

const allNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'employee'] },
  { href: '/recruitment', icon: Briefcase, label: 'Recruitment', roles: ['admin'] },
  { href: '/recruitment/parse', icon: FileText, label: 'Parse Resume', roles: ['admin'] },
  { href: '/employees', icon: Users, label: 'Employees', roles: ['admin'] },
  { href: '/profile', icon: CircleUser, label: 'Profile', roles: ['admin', 'employee'] },
  { href: '/leaves', icon: CalendarDays, label: 'Leaves', roles: ['admin', 'employee'] },
  { href: '/performance', icon: BarChart, label: 'Performance', roles: ['admin', 'employee'] },
  { href: '/onboarding', icon: PackagePlus, label: 'Onboarding', roles: ['admin'] },
  { href: '/payroll', icon: CreditCard, label: 'Payroll', roles: ['admin'] },
  { href: '/assessments', icon: FileText, label: 'Assessments', roles: ['admin', 'employee'] },
  { href: '/helpdesk', icon: FileQuestion, label: 'Helpdesk', roles: ['admin', 'employee'] },
  { href: '/company-feed', icon: Newspaper, label: 'Company Feed', roles: ['admin', 'employee'] },
  { href: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'employee'] },
];

function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role || (params.role as string);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const sidebarRef = React.useRef(null);

  const getBasePath = (path: string) => '/' + path.split('/').slice(2).join('/');
  const currentBasePath = getBasePath(pathname);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !(sidebarRef.current as any).contains(event.target)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SidebarContent = () => (
     <div
        className="h-full bg-indigo-900 text-white flex flex-col items-center py-4 transition-all duration-300"
      >
        <div className="flex items-center justify-center h-12 w-full px-4">
          <Logo className="text-white w-10 h-10" />
          {isExpanded && <span className="ml-2 font-bold text-white">OptiTalent</span>}
        </div>

        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col items-start mt-6 space-y-2 w-full px-2 flex-grow">
            {navItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? currentBasePath === '/dashboard'
                : currentBasePath.startsWith(item.href) && item.href !== '/dashboard';

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/${role}${item.href}`}
                      className={`flex items-center w-full gap-4 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive ? 'bg-indigo-700' : ''}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {(isExpanded || isMobileOpen) && <span className="text-sm">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && !isMobileOpen &&(
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          <div className="flex flex-col items-start space-y-4 pb-4 w-full px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-indigo-700">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage
                        src={`https://placehold.co/100x100?text=${(user?.profile?.name || user?.email || 'U').charAt(0)}`}
                        alt="User avatar" data-ai-hint="person avatar"
                      />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    {(isExpanded || isMobileOpen) && (
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-sm truncate">{user?.profile?.name || user?.email}</p>
                            <p className="text-xs text-white/70 truncate">{user?.role}</p>
                        </div>
                    )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
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
      </div>
  );

  return (
    <>
      {/* Mobile-only hamburger menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button size="icon" variant="outline" onClick={() => setIsMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar for Desktop */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          hidden md:flex flex-col fixed top-0 left-0 z-50 h-full transition-all duration-300
          ${isExpanded ? 'w-56' : 'w-20'}
        `}
      >
        <SidebarContent />
      </aside>
      
      {/* Sidebar for Mobile */}
      <aside
        ref={sidebarRef}
        className={`
          md:hidden fixed top-0 left-0 z-50 h-full w-56 transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
         <SidebarContent />
      </aside>
    </>
  );
}

function AppHeader() {
  // Header can be used for breadcrumbs, search, or other actions
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between ml-20 md:ml-0">
      {/* Intentionally empty for this design */}
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
    if (!loading && user && params.role !== user.role) {
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
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 flex flex-col md:pl-20">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
