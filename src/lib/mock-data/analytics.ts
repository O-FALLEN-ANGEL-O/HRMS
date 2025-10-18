
/**
 * @fileOverview Static mock data for the HR analytics dashboard.
 */
import type { DashboardData } from '@/lib/types/analytics';

export const mockDashboardData: DashboardData = {
  stats: {
    totalEmployees: 524,
    attritionRate: 8.2,
    avgTenure: '3.1 years',
    hiringPipeline: 48,
  },
  headcountByDept: [
    { department: 'Engineering', count: 120 },
    { department: 'Customer Support', count: 210 },
    { department: 'Sales', count: 75 },
    { department: 'Marketing', count: 45 },
    { department: 'HR & Admin', count: 74 },
  ],
  recruitmentFunnel: [
    { stage: 'Applied', count: 320 },
    { stage: 'Screening', count: 150 },
    { stage: 'Interview', count: 48 },
    { stage: 'Offer', count: 15 },
    { stage: 'Hired', count: 9 },
  ],
};
