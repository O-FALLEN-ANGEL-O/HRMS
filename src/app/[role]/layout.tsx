

'use client';

import * as React from 'react';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
               <LoadingLogo />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col h-screen">
                    <AppHeader />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
