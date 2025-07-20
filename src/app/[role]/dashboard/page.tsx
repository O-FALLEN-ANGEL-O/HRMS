
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import RecruiterDashboard from '@/components/dashboards/recruiter-dashboard';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import { Logo } from '@/components/logo';

export default function DashboardPage() {
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
  const name = user?.profile?.name || user?.email?.split('@')[0] || 'User';

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
        return <ManagerDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-headline tracking-tight">Welcome back, {name}!</h1>
          <p className="text-muted-foreground">Here&apos;s a summary of what&apos;s happening at OptiTalent today.</p>
       </div>
       {renderDashboard()}
    </div>
  );
}
