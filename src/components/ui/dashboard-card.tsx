
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from './button';

interface DashboardCardProps {
  title: string;
  icon: React.ElementType;
  actionIcon?: React.ElementType;
  children: React.ReactNode;
}

export function DashboardCard({ title, icon: Icon, actionIcon: ActionIcon, children }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <span>{title}</span>
        </CardTitle>
        {ActionIcon && <Button variant="ghost" size="icon"><ActionIcon className="h-4 w-4 text-muted-foreground" /></Button>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
