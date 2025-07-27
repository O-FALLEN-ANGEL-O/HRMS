
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
  TrendingUp,
  Handshake,
  GraduationCap,
  CalendarOff,
  Newspaper,
  Clock,
  Heart,
  BrainCircuit,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatedBot } from '@/components/ui/animated-bot';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<any>;
};

export const navConfig: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Leaves', href: '/leaves', icon: CalendarOff },
    { label: 'Shifts', href: '/shifts', icon: Clock },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  hr: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Leaves', href: '/leaves', icon: CalendarOff },
    { label: 'Shifts', href: '/shifts', icon: Clock },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  manager: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Leaves', href: '/leaves', icon: CalendarOff },
    { label: 'Shifts', href: '/shifts', icon: Clock },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  employee: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leaves', href: '/leaves', icon: CalendarOff },
    { label: 'My Schedule', href: '/shifts', icon: Clock },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  recruiter: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  trainee: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'qa-analyst': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Quality', href: '/qa-analyst/quality', icon: ShieldCheck },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'process-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Performance', href: '/process-manager/performance', icon: TrendingUp },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'team-leader': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'My Team', href: '/employees', icon: Users },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'Leaves', href: '/leaves', icon: CalendarOff },
    { label: 'Shifts', href: '/shifts', icon: Clock },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
   marketing: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  finance: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'it-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Helpdesk', href: '/helpdesk', icon: HelpCircle },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'operations-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Shifts', href: '/shifts', icon: Clock },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  'account-manager': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  trainer: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Trainees', href: '/employees', icon: Users },
    { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
    { label: 'Learning', href: '/learning', icon: GraduationCap },
    { label: 'Recognition', href: '/recognition', icon: Heart },
    { label: 'AI Tools', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Company Feed', href: '/company-feed', icon: Newspaper },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  guest: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ],
};

const aiToolsNav: NavItem[] = [
    { label: 'HR Assistant', href: '/ai-tools/chatbot', icon: AnimatedBot },
    { label: 'Career Predictor', href: '/ai-tools/career-predictor', icon: BrainCircuit },
]

export const useNav = (role: string): NavItem[] => {
  return useMemo(() => {
    // A special case for the AI Tools to show a sub-menu
    const mainNav = navConfig[role] || [];
    const aiToolsIndex = mainNav.findIndex(item => item.href.includes('/ai-tools'));
    
    if (aiToolsIndex !== -1) {
        // This is a simplified representation. A real app might have a different structure for sub-menus.
        // For now, we'll just link to the main chatbot page.
        return mainNav;
    }
    
    return mainNav;
  }, [role]);
};
