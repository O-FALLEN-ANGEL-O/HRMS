
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useNav } from '@/hooks/use-nav';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './logo';
import { ScrollArea } from './ui/scroll-area';

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems = useNav();

  if (!user) return null;

  return (
      <ScrollArea className="h-full">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={`/${user.role}${item.href}`}>
                  <SidebarMenuButton
                    isActive={pathname === `/${user.role}${item.href}`}
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
      </ScrollArea>
  );
}
