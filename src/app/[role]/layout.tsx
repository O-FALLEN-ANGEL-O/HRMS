

'use client';

import * as React from 'react';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';

function AppContent({ children }: { children: React.ReactNode }) {
    const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
    const handleContentClick = () => {
        if (isMobile && openMobile) {
            setOpenMobile(false);
        }
    }
    return (
         <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto" onClick={handleContentClick}>
                {children}
            </main>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        // Do not redirect if we are already on a public page like login or signup.
        const isPublicPage = pathname === '/' || pathname === '/signup';
        if (!loading && !user && !isPublicPage) {
            router.push('/');
        }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
               <LoadingLogo />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-muted/40">
                <AppSidebar />
                <AppContent>{children}</AppContent>
            </div>
        </SidebarProvider>
    );
}
