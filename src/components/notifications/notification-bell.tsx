
'use client';

import React, { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { notifications as allNotifications, type Notification } from '@/lib/mock-data/notifications';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function NotificationBell() {
    const { user } = useAuth();
    const [readNotifications, setReadNotifications] = useState<string[]>([]);

    const userNotifications = useMemo(() => {
        if (!user) return [];
        return allNotifications[user.role] || [];
    }, [user]);

    const unreadCount = useMemo(() => {
        return userNotifications.filter(n => !readNotifications.includes(n.id)).length;
    }, [userNotifications, readNotifications]);

    const handleMarkAsRead = (id: string) => {
        if (!readNotifications.includes(id)) {
            setReadNotifications(prev => [...prev, id]);
        }
    };
    
    const handleMarkAllAsRead = () => {
        const allIds = userNotifications.map(n => n.id);
        setReadNotifications(allIds);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadCount > 0 && <Badge variant="secondary">{unreadCount} New</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {userNotifications.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">No notifications yet.</p>
                    ) : (
                        userNotifications.map(notification => {
                            const isRead = readNotifications.includes(notification.id);
                            return (
                                <DropdownMenuItem key={notification.id} className="items-start gap-3" onClick={() => handleMarkAsRead(notification.id)}>
                                    {!isRead && <span className="mt-1 block h-2 w-2 rounded-full bg-primary" />}
                                    <div className={cn("flex-1", isRead && "pl-5")}>
                                        <p className="text-sm font-medium">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <Check className="mr-2 h-4 w-4" />
                    <span>Mark all as read</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
