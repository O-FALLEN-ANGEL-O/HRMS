
'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';

import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import RecruiterDashboard from '@/components/dashboards/recruiter-dashboard';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import QaAnalystDashboard from '@/components/dashboards/qa-analyst-dashboard';
import ProcessManagerDashboard from '@/components/dashboards/process-manager-dashboard';
import TeamLeaderDashboard from '@/components/dashboards/team-leader-dashboard';
import MarketingDashboard from '@/components/dashboards/marketing-dashboard';
import FinanceDashboard from '@/components/dashboards/finance-dashboard';
import ItManagerDashboard from '@/components/dashboards/it-manager-dashboard';
import { Logo } from '@/components/logo';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="text-primary w-12 h-12" />
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || 'employee';

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
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-headline tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
       </div>
       {renderDashboard()}
    </div>
  );
}
