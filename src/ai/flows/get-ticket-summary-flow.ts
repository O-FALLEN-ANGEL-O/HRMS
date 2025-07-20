
'use server';

/**
 * @fileOverview Generates mock HR ticket summary data for the Process Manager dashboard.
 * 
 * - getTicketSummaryAction - A function that returns a structured set of ticket analytics data.
 */

import { ai } from '@/ai/genkit';
import { TicketDataSchema, type TicketData } from './get-ticket-summary-flow.types';


export async function getTicketSummaryAction(): Promise<TicketData> {
  return getTicketDataFlow();
}

const prompt = ai.definePrompt({
  name: 'getTicketDataPrompt',
  output: { schema: TicketDataSchema },
  prompt: `You are an expert HR Data Analyst. Your task is to generate a realistic but fictional set of helpdesk ticket data for a mid-sized tech company. This data will be used to populate a pie chart on the Process Manager's dashboard.

  Please generate a count of tickets for the following categories:
  - IT Support (e.g., software issues, hardware problems)
  - HR Query (e.g., benefits, policy clarification)
  - Payroll Issue (e.g., payslip errors)
  - Facilities (e.g., office maintenance)
  - General Inquiry

  The total number of tickets should be between 150 and 300. Distribute the tickets realistically, with IT Support likely being the highest category.

  Return the data in the specified JSON format.
  `,
});


const getTicketDataFlow = ai.defineFlow(
  {
    name: 'getTicketDataFlow',
    outputSchema: TicketDataSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
