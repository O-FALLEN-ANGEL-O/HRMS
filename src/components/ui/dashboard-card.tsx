
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  actionIcon?: LucideIcon;
  value?: string | number;
  description?: string;
  children?: React.ReactNode;
  onActionClick?: () => void;
}

const DashboardCardComponent = ({ title, icon: Icon, actionIcon: ActionIcon, value, description, children, onActionClick }: DashboardCardProps) => {
  
  const cardContent = value !== undefined ? (
    // Stat card variant
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
  ) : (
    // Widget card variant
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <span>{title}</span>
        </CardTitle>
        {ActionIcon && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onActionClick}><ActionIcon className="h-4 w-4 text-muted-foreground" /></Button>}
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );

  return cardContent;
};

DashboardCardComponent.displayName = 'DashboardCard';

export const DashboardCard = React.memo(DashboardCardComponent);
