
'use server';

/**
 * @fileOverview Generates mock HR analytics dashboard data.
 * 
 * - getDashboardData - A function that returns a structured set of HR analytics data.
 */

import { ai } from '@/ai/genkit';
import { DashboardData, DashboardDataSchema } from './get-dashboard-data.types';
import { z } from 'zod';

export async function getDashboardData(): Promise<DashboardData> {
  return getDashboardDataFlow();
}

const prompt = ai.definePrompt({
  name: 'getDashboardDataPrompt',
  model: 'googleai/gemini-1.5-flash',
  output: { schema: DashboardDataSchema },
  prompt: `You are an expert HR Data Analyst. Your task is to generate a realistic but fictional set of HR dashboard data for a mid-sized tech company named OptiTalent. The data should be comprehensive and suitable for populating a dashboard with charts and statistics.

  Please generate data for the following categories:
  
  1.  **Key Statistics:**
      - Total number of employees (between 400 and 600).
      - Attrition rate (between 8% and 15%).
      - Average employee tenure in years, returned as a string (e.g., "3.2 years").
      - Number of candidates currently in the hiring pipeline (between 50 and 100).

  2.  **Headcount by Department:**
      - Provide a breakdown for the following departments: Engineering, Product, Design, Marketing, Sales, HR, and Operations. Ensure the numbers add up to the total employees. Engineering should be the largest department.

  3.  **Leave Trends:**
      - This is not needed. Do not generate leave trend data.

  4.  **Recruitment Funnel:**
      - Provide a count of candidates at each of the following stages: Applied, Screening, Interview, Offer, Hired. The numbers should decrease as they move down the funnel. Start with a large number of applicants (e.g., > 500).

  Return the data in the specified JSON format. Ensure avgTenure is a string.
  `,
});


const getDashboardDataFlow = ai.defineFlow(
  {
    name: 'getDashboardDataFlow',
    inputSchema: z.void(),
    outputSchema: DashboardDataSchema,
    retries: 3,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
