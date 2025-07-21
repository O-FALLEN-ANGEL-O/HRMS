
'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  HelpCircle,
  BarChart2,
  DollarSign,
  ClipboardCheck,
  Award,
  Building,
  Target,
  Factory,
  ShieldCheck,
  Puzzle,
  BookOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from './use-auth';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navConfig = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  hr: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  manager: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  employee: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Assessments', href: '/assessments', icon: Puzzle },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  recruiter: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'qa-analyst': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Quality', href: '/quality', icon: ShieldCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'process-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'team-leader': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
   marketing: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  finance: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'it-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'operations-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  guest: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ],
};

export const useNav = (): NavItem[] => {
  const { user } = useAuth();
  const role = user?.role || 'guest';

  return useMemo(() => {
    return navConfig[role] || [];
  }, [role]);
};
