
/**
 * @fileOverview Types and schemas for the getDashboardData flow.
 * 
 * - DashboardData - The return type for the getDashboardData function.
 * - DashboardDataSchema - The Zod schema for the dashboard data.
 */
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
