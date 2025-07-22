
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useNav } from '@/hooks/use-nav';
import { Logo } from './logo';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSidebar } from './ui/sidebar';

export default function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const role = (params.role as string) || 'guest';
  const navItems = useNav(role);
  const { user, logout } = useAuth();
  const { state } = useSidebar();

  return (
    <Sidebar>
      <ScrollArea className="h-full">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={`/${role}${item.href}`}>
                  <SidebarMenuButton
                    isActive={pathname === `/${role}${item.href}`}
                    icon={item.icon}
                    tooltip={item.label}
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
            {user && (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profile.profile_picture_url} data-ai-hint="person avatar"/>
                        <AvatarFallback>{user.profile.full_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                     {state === 'expanded' && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.profile.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                     )}
                </div>
            )}
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={logout}
                    icon={LogOut}
                    tooltip="Logout"
                  >
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </ScrollArea>
    </Sidebar>
  );
}
