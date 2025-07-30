import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { poppins, spaceGrotesk } from "@/lib/fonts"
import { AuthProvider } from '@/hooks/use-auth'
import ClientLayout from './client-layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "OptiTalent HRMS",
  description: "A Next-Generation HRMS for modern businesses.",
  icons: [{ rel: "icon", url: "/icon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} font-body antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
