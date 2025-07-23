
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
  BookOpen,
  Bot,
  TrendingUp
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navConfig: Record<string, NavItem[]> = {
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
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Profile', href: '/profile', icon: FileText },
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
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  manager: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
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
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  recruiter: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'qa-analyst': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Quality', href: '/quality', icon: ShieldCheck },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'process-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Performance', href: '/performance', icon: TrendingUp },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'team-leader': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Leaves', href: '/leaves', icon: Calendar },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
   marketing: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  finance: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'it-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'operations-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: Bot },
    { label: 'Company Feed', href: '/company-feed', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  guest: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ],
};

export const useNav = (role: string): NavItem[] => {
  return useMemo(() => {
    return navConfig[role] || [];
  }, [role]);
};
