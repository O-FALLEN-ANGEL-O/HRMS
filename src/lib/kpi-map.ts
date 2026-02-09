
'use client';
import dynamic from 'next/dynamic';
import React from 'react';

// This file centralizes the dynamic imports for KPI cards
// to be used across different pages like analytics.

const AdminKpis = dynamic(() => import('@/components/dashboards/kpi-cards/admin-kpis').then(mod => mod.AdminKpis), { ssr: false });
const HrKpis = dynamic(() => import('@/components/dashboards/kpi-cards/hr-kpis').then(mod => mod.HrKpis), { ssr: false });
const ManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/manager-kpis').then(mod => mod.ManagerKpis), { ssr: false });
const EmployeeKpis = dynamic(() => import('@/components/dashboards/kpi-cards/employee-kpis').then(mod => mod.EmployeeKpis), { ssr: false });
const RecruiterKpis = dynamic(() => import('@/components/dashboards/kpi-cards/recruiter-kpis').then(mod => mod.RecruiterKpis), { ssr: false });
const FinanceKpis = dynamic(() => import('@/components/dashboards/kpi-cards/finance-kpis').then(mod => mod.FinanceKpis), { ssr: false });
const ItManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/it-manager-kpis').then(mod => mod.ItManagerKpis), { ssr: false });
const OperationsManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/operations-manager-kpis').then(mod => mod.OperationsManagerKpis), { ssr: false });
const ProcessManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/process-manager-kpis').then(mod => mod.ProcessManagerKpis), { ssr: false });
const QaAnalystKpis = dynamic(() => import('@/components/dashboards/kpi-cards/qa-analyst-kpis').then(mod => mod.QaAnalystKpis), { ssr: false });
const TeamLeaderKpis = dynamic(() => import('@/components/dashboards/kpi-cards/team-leader-kpis').then(mod => mod.TeamLeaderKpis), { ssr: false });
const TrainerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/trainer-kpis').then(mod => mod.TrainerKpis), { ssr: false });

export const kpiMap: Record<string, React.ComponentType> = {
    admin: AdminKpis,
    hr: HrKpis,
    manager: ManagerKpis,
    employee: EmployeeKpis,
    recruiter: RecruiterKpis,
    finance: FinanceKpis,
    'it-manager': ItManagerKpis,
    'operations-manager': OperationsManagerKpis,
    'process-manager': ProcessManagerKpis,
    'qa-analyst': QaAnalystKpis,
    'team-leader': TeamLeaderKpis,
    trainer: TrainerKpis,
};
