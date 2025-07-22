

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const ManagerDashboard = dynamic(() => import('@/components/dashboards/manager-dashboard'), { loading: () => <DashboardSkeleton /> });
const RecruiterDashboard = dynamic(() => import('@/components/dashboards/recruiter-dashboard'), { loading: () => <DashboardSkeleton /> });
const EmployeeDashboard = dynamic(() => import('@/components/dashboards/employee-dashboard'), { loading: () => <DashboardSkeleton /> });
const QaAnalystDashboard = dynamic(() => import('@/components/dashboards/qa-analyst-dashboard'), { loading: () => <DashboardSkeleton /> });
const ProcessManagerDashboard = dynamic(() => import('@/components/dashboards/process-manager-dashboard'), { loading: () => <DashboardSkeleton /> });
const TeamLeaderDashboard = dynamic(() => import('@/components/dashboards/team-leader-dashboard'), { loading: () => <DashboardSkeleton /> });
const MarketingDashboard = dynamic(() => import('@/components/dashboards/marketing-dashboard'), { loading: () => <DashboardSkeleton /> });
const FinanceDashboard = dynamic(() => import('@/components/dashboards/finance-dashboard'), { loading: () => <DashboardSkeleton /> });
const ItManagerDashboard = dynamic(() => import('@/components/dashboards/it-manager-dashboard'), { loading: () => <DashboardSkeleton /> });
const OperationsDashboard = dynamic(() => import('@/components/dashboards/operations-dashboard'), { loading: () => <DashboardSkeleton /> });

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}


export default function AnalyticsPage() {
  const params = useParams();
  const role = params.role as string || 'employee';

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
        return <ManagerDashboard />;
      case 'team-leader':
        return <TeamLeaderDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'qa-analyst':
        return <QaAnalystDashboard />;
      case 'process-manager':
        return <ProcessManagerDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'it-manager':
        return <ItManagerDashboard />;
      case 'operations-manager':
        return <OperationsDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="font-headline tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
       </div>
       {renderDashboard()}
    </div>
  );
}
