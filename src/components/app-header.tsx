
'use client';

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Bell, Search } from "lucide-react";


export default function AppHeader() {
  const { searchTerm, setSearchTerm } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden"/>
         <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary w-64" 
              placeholder="Search..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="rounded-full"><Bell/></Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
