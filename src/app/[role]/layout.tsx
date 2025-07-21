

'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LoadingLogo } from '@/components/loading-logo';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) {
        // This case should ideally be handled by the redirect, but as a fallback
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <LoadingLogo />
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  React.useEffect(() => {
    // Wait until loading is complete before running any checks
    if (loading) {
      return;
    }

    // If loading is done and there's still no user, redirect to login
    if (!user) {
      router.push('/');
      return;
    }
    
    // If user is logged in, check if the URL role matches their actual role
    if (user && params.role !== user.role) {
      const pagePath = pathname.split('/').slice(2).join('/');
      const newPath = pagePath ? `/${user.role}/${pagePath}` : `/${user.role}/dashboard`;
      router.push(newPath);
    }
  }, [user, loading, router, params, pathname]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingLogo />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }
  
  // Render children only if user is confirmed and matches the role in the URL
  if (user && user.role === params.role) {
      return <LayoutContent>{children}</LayoutContent>;
  }
  
  // Render a loading state while redirecting if roles don't match
  return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingLogo />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
  );
}
