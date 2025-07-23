
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { LoadingLogo } from '@/components/loading-logo';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), {
  loading: () => <Skeleton className="hidden md:flex h-screen w-[3.75rem]" />,
  ssr: false,
});

const AppHeader = dynamic(() => import('@/components/app-header'), {
  loading: () => <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6"><Skeleton className="h-8 w-full" /></header>,
  ssr: false,
});


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

// Main App Layout to wrap pages (excluding public routes)
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isPublicPage =
    pathname === '/' ||
    pathname === '/signup' ||
    pathname.startsWith('/walkin-drive') ||
    pathname.startsWith('/applicant');

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
              {children}
            </div>
          </main>
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
        <link rel="icon" href="/animated-favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased overflow-x-hidden`}
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
