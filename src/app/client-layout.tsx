'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, Calendar, User, Newspaper, Grid2X2, Clock, CheckCircle, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), {
  loading: () => <Skeleton className="hidden md:flex h-screen w-[3.75rem]" />,
  ssr: false,
});

const AppHeader = dynamic(() => import('@/components/app-header'), {
  loading: () => <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6"><Skeleton className="h-8 w-full" /></header>,
  ssr: false,
});

function QuickViewSheet() {
    const { user, logout } = useAuth();
    if (!user) return null;

    const summaryData = {
        checkIn: '09:12 AM',
        totalHours: '8h 18m',
        tasksPending: 3,
        leaveBalance: 14.5
    };

    return (
         <Sheet>
            <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center w-16 h-16 -mt-4 bg-primary text-primary-foreground rounded-full shadow-lg">
                    <Grid2X2 className="h-6 w-6" />
                </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader className="text-left">
                    <SheetTitle>Quick Summary</SheetTitle>
                    <SheetDescription>Your daily stats at a glance.</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Clock className="h-4 w-4" /> Today's Log</div>
                            <p className="text-xl font-bold">{summaryData.checkIn}</p>
                            <p className="text-xs">{summaryData.totalHours} worked</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm"><CheckCircle className="h-4 w-4" /> Pending Tasks</div>
                            <p className="text-xl font-bold">{summaryData.tasksPending}</p>
                            <p className="text-xs">items require action</p>
                        </div>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Wallet className="h-4 w-4" /> Leave Balance</div>
                        <p className="text-xl font-bold">{summaryData.leaveBalance} Days</p>
                        <p className="text-xs">available for the year</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" asChild><Link href={`/${user.role}/leaves`}>Apply for Leave</Link></Button>
                        <Button variant="outline" asChild><Link href={`/${user.role}/attendance/regularize`}>Regularize Attendance</Link></Button>
                    </div>
                     <Button variant="destructive" className="w-full" onClick={logout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}


function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const role = user?.role || 'employee';

    const navItems = [
        { href: `/${role}/dashboard`, icon: Home, label: 'Home' },
        { href: `/${role}/attendance`, icon: Calendar, label: 'Attendance' },
        { href: `/${role}/company-feed`, icon: Newspaper, label: 'Feed' },
        { href: `/${role}/profile`, icon: User, label: 'Profile' },
    ];
    
    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t z-20">
            <div className="flex justify-around items-center h-16">
                <Link href={navItems[0].href} className={cn("flex flex-col items-center justify-center flex-1 h-full", pathname === navItems[0].href ? 'text-primary' : 'text-muted-foreground')}>
                    <Home className="h-6 w-6" />
                    <span className="text-xs">{navItems[0].label}</span>
                </Link>
                <Link href={navItems[1].href} className={cn("flex flex-col items-center justify-center flex-1 h-full", pathname === navItems[1].href ? 'text-primary' : 'text-muted-foreground')}>
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs">{navItems[1].label}</span>
                </Link>
                <div className="flex-shrink-0 w-16">
                    <QuickViewSheet />
                </div>
                <Link href={navItems[2].href} className={cn("flex flex-col items-center justify-center flex-1 h-full", pathname === navItems[2].href ? 'text-primary' : 'text-muted-foreground')}>
                    <Newspaper className="h-6 w-6" />
                    <span className="text-xs">{navItems[2].label}</span>
                </Link>
                <Link href={navItems[3].href} className={cn("flex flex-col items-center justify-center flex-1 h-full", pathname === navItems[3].href ? 'text-primary' : 'text-muted-foreground')}>
                    <User className="h-6 w-6" />
                    <span className="text-xs">{navItems[3].label}</span>
                </Link>
            </div>
        </footer>
    )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage =
    pathname === '/' ||
    pathname === '/signup' ||
    pathname.startsWith('/walkin-drive') ||
    pathname.startsWith('/applicant');

    const isDashboard = user && pathname === `/${user.role}/dashboard`;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (isPublicPage || !user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-muted/40 w-full max-w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <AppHeader />
          <main className="flex-1 overflow-y-auto w-full">
             <div className="p-4 sm:p-6 lg:p-8">
                {!isDashboard && (
                     <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}
                {children}
            </div>
            <div className="h-20 md:hidden" />
          </main>
           <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AppLayout>
                {children}
            </AppLayout>
        </ThemeProvider>
    )
}
