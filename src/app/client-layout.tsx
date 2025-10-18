
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, AuthProvider } from '@/hooks/use-auth';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), {
  loading: () => <Skeleton className="hidden md:flex h-screen w-[3.75rem]" />,
  ssr: false,
});

const AppHeader = dynamic(() => import('@/components/app-header'), {
  loading: () => <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6"><Skeleton className="h-8 w-full" /></header>,
  ssr: false,
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage =
    pathname === '/' ||
    pathname === '/signup' ||
    pathname === '/role-selector' ||
    pathname.startsWith('/walkin-drive') ||
    pathname.startsWith('/applicant');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* You can put a loading spinner here */}
      </div>
    );
  }

  if (isPublicPage || !user) {
    return <>{children}</>;
  }
  
  if (pathname === '/') {
    router.push(`/${user.role}/dashboard`);
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-muted/40 w-full max-w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <AppHeader />
          <main className="flex-1 overflow-y-auto w-full">
             <div className="p-4 sm:p-6 lg:p-8">
                {children}
            </div>
            <div className="h-20 md:hidden" />
          </main>
           {/* MobileBottomNav can be added here if needed */}
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
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
        </AuthProvider>
    )
}
