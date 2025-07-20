
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  isLoading?: boolean;
}

export function DashboardCard({ title, value, description, icon: Icon, isLoading }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
