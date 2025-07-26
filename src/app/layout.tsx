
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, Calendar, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), {
  loading: () => <Skeleton className="hidden md:flex h-screen w-[3.75rem]" />,
  ssr: false,
});

const AppHeader = dynamic(() => import('@/components/app-header'), {
  loading: () => <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6"><Skeleton className="h-8 w-full" /></header>,
  ssr: false,
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});


function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const role = user?.role || 'employee';

    const navItems = [
        { href: `/${role}/dashboard`, icon: Home, label: 'Home' },
        { href: `/${role}/attendance`, icon: Calendar, label: 'Attendance' },
        { href: `/${role}/profile`, icon: User, label: 'Profile' },
    ];
    
    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t z-20">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className={cn(
                        "flex flex-col items-center w-full p-2",
                        pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                    )}>
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </div>
        </footer>
    )
}

function FloatingActionButton() {
    return (
        <div className="md:hidden fixed bottom-20 right-4 z-20">
            <Button size="icon" className="w-14 h-14 rounded-full shadow-lg">
                <Plus className="h-6 w-6" />
            </Button>
        </div>
    )
}


// Main App Layout to wrap pages (excluding public routes)
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
           <FloatingActionButton />
        </div>
      </div>
    </SidebarProvider>
  );
}

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>OptiTalent HRMS</title>
        <meta name="description" content="A Next-Generation HRMS for modern businesses." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} font-body antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
