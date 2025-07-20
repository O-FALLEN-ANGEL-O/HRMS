'use server';

/**
 * @fileOverview Generates mock HR analytics dashboard data.
 * 
 * - getDashboardData - A function that returns a structured set of HR analytics data.
 * - DashboardData - The return type for the getDashboardData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DashboardStatsSchema = z.object({
  totalEmployees: z.number().describe('The total number of current employees.'),
  attritionRate: z.number().describe('The percentage of employees who left the company in the last year.'),
  avgTenure: z.string().describe("The average length of time an employee has been with the company (e.g., '3.2 years')."),
  hiringPipeline: z.number().describe('The number of active candidates in the hiring process.'),
});

const HeadcountByDeptSchema = z.array(z.object({
  department: z.string().describe('The name of the department.'),
  count: z.number().describe('The number of employees in the department.'),
}));

const LeaveTrendsSchema = z.array(z.object({
  month: z.string().describe('The month (e.g., "Jan", "Feb").'),
  days: z.number().describe('The total number of leave days taken in that month.'),
}));

const RecruitmentFunnelSchema = z.array(z.object({
  stage: z.string().describe('The stage in the recruitment funnel.'),
  count: z.number().describe('The number of candidates at that stage.'),
}));

export const DashboardDataSchema = z.object({
  stats: DashboardStatsSchema,
  headcountByDept: HeadcountByDeptSchema,
  leaveTrends: LeaveTrendsSchema,
  recruitmentFunnel: RecruitmentFunnelSchema,
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

export async function getDashboardData(): Promise<DashboardData> {
  return getDashboardDataFlow();
}

const prompt = ai.definePrompt({
  name: 'getDashboardDataPrompt',
  output: { schema: DashboardDataSchema },
  prompt: `You are an expert HR Data Analyst. Your task is to generate a realistic but fictional set of HR dashboard data for a mid-sized tech company named OptiTalent. The data should be comprehensive and suitable for populating a dashboard with charts and statistics.

  Please generate data for the following categories:
  
  1.  **Key Statistics:**
      - Total number of employees (between 400 and 600).
      - Attrition rate (between 8% and 15%).
      - Average employee tenure (between 2.5 and 4.5 years).
      - Number of candidates currently in the hiring pipeline (between 50 and 100).

  2.  **Headcount by Department:**
      - Provide a breakdown for the following departments: Engineering, Product, Design, Marketing, Sales, HR, and Operations. Ensure the numbers add up to the total employees. Engineering should be the largest department.

  3.  **Leave Trends:**
      - Provide data for the last 6 months (e.g., Jan, Feb, Mar, Apr, May, Jun).
      - Show the total number of leave days taken each month. Show some realistic fluctuation.

  4.  **Recruitment Funnel:**
      - Provide a count of candidates at each of the following stages: Applied, Screening, Interview, Offer, Hired. The numbers should decrease as they move down the funnel. Start with a large number of applicants (e.g., > 500).

  Return the data in the specified JSON format.
  `,
});


const getDashboardDataFlow = ai.defineFlow(
  {
    name: 'getDashboardDataFlow',
    outputSchema: DashboardDataSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
