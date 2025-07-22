
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';
import { usePathname } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';
import * as React from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

// We create a new component for the main app layout to keep the root layout clean.
function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    const isPublicPage = pathname === '/' || pathname === '/signup' || pathname.startsWith('/walkin-drive');

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
               <LoadingLogo />
            </div>
        )
    }

    if (isPublicPage || !user) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-muted/40">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-4 sm:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}


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
        <link rel="icon" href="/animated-favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`} suppressHydrationWarning>
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
