

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from './button';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  actionIcon?: LucideIcon;
  value?: string | number;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardCard({ title, icon: Icon, actionIcon: ActionIcon, value, description, children }: DashboardCardProps) {
  if (value !== undefined) {
    // Stat card variant
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
  }
  
  // Widget card variant
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <span>{title}</span>
        </CardTitle>
        {ActionIcon && <Button variant="ghost" size="icon" className="h-6 w-6"><ActionIcon className="h-4 w-4 text-muted-foreground" /></Button>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
