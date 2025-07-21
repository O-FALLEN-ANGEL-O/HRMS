

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

  return <LayoutContent>{children}</LayoutContent>;
}
