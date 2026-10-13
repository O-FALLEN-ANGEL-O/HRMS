import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HR+", template: "%s · HR+" },
  description: "HR+ — people, time off, attendance, payroll, hiring and performance in one place. A demo HRMS by Prajwal DL.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1528" },
  ],
};

// Applies the saved theme before paint to avoid a flash.
const themeScript = `(()=>{try{const t=localStorage.getItem('hrp-theme');const d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="bottom-right" toastOptions={{ className: "!rounded-[10px] !border-line !bg-surface !text-ink !font-sans" }} />
      </body>
    </html>
  );
}
