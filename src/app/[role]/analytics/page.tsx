

'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import RecruiterDashboard from '@/components/dashboards/recruiter-dashboard';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import QaAnalystDashboard from '@/components/dashboards/qa-analyst-dashboard';
import ProcessManagerDashboard from '@/components/dashboards/process-manager-dashboard';
import TeamLeaderDashboard from '@/components/dashboards/team-leader-dashboard';
import MarketingDashboard from '@/components/dashboards/marketing-dashboard';
import FinanceDashboard from '@/components/dashboards/finance-dashboard';
import ItManagerDashboard from '@/components/dashboards/it-manager-dashboard';
import OperationsDashboard from '@/components/dashboards/operations-dashboard';
import { Logo } from '@/components/logo';

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
