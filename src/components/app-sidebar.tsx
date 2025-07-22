
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useNav } from '@/hooks/use-nav';
import { Logo } from './logo';
import { ScrollArea } from './ui/scroll-area';

export default function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const role = (params.role as string) || 'guest';
  const navItems = useNav(role);

  return (
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
      </ScrollArea>
  );
}
