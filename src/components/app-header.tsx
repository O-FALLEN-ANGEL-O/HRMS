
'use client';

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";


export default function AppHeader() {
  const { searchTerm, setSearchTerm } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden"/>
      <div className="flex-1">
        {/* The global search bar was removed from here to avoid duplication on the dashboard. */}
      </div>
      <ThemeToggle />
    </header>
  );
}
