
'use server';

import type { DashboardData } from "@/lib/types/analytics";

const mockDashboardData: DashboardData = {
  stats: {
    totalEmployees: 528,
    attritionRate: 12.5,
    avgTenure: "3.4 years",
    hiringPipeline: 78,
  },
  headcountByDept: [
    { department: 'Engineering', count: 210 },
    { department: 'Product', count: 45 },
    { department: 'Design', count: 30 },
    { department: 'Marketing', count: 60 },
    { department: 'Sales', count: 85 },
    { department: 'HR', count: 28 },
    { department: 'Operations', count: 70 },
  ],
  recruitmentFunnel: [
    { stage: 'Applied', count: 620 },
    { stage: 'Screening', count: 250 },
    { stage: 'Interview', count: 95 },
    { stage: 'Offer', count: 25 },
    { stage: 'Hired', count: 18 },
  ]
};


export async function getDashboardDataAction(): Promise<DashboardData> {
  // Simulate a very short network delay to mimic a real API call
  await new Promise(resolve => setTimeout(resolve, 250));
  return mockDashboardData;
}
