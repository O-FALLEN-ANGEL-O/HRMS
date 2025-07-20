'use server';

/**
 * @fileOverview An AI agent that categorizes a support ticket.
 *
 * - categorizeTicket - A function that handles the ticket categorization process.
 * - CategorizeTicketInput - The input type for the categorizeTicket function.
 * - CategorizeTicketOutput - The return type for the categorizeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTicketInputSchema = z.object({
  subject: z.string().describe('The subject of the support ticket.'),
  description: z.string().describe('The detailed description of the support ticket.'),
});
export type CategorizeTicketInput = z.infer<typeof CategorizeTicketInputSchema>;

const CategorizeTicketOutputSchema = z.object({
  category: z.enum(['IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry']).describe('The suggested category for the support ticket.'),
  priority: z.enum(['Low', 'Medium', 'High']).describe('The suggested priority for the ticket.'),
});
export type CategorizeTicketOutput = z.infer<typeof CategorizeTicketOutputSchema>;

export async function categorizeTicket(input: CategorizeTicketInput): Promise<CategorizeTicketOutput> {
  return categorizeTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTicketPrompt',
  input: {schema: CategorizeTicketInputSchema},
  output: {schema: CategorizeTicketOutputSchema},
  prompt: `You are an expert support ticket analyst. Your job is to categorize and prioritize incoming support tickets based on their subject and description.

  Subject: {{{subject}}}
  Description: {{{description}}}

  Categories:
  - IT Support (e.g., software issues, hardware problems, network access)
  - HR Query (e.g., benefits questions, policy clarification, leave requests)
  - Payroll Issue (e.g., payslip errors, salary questions)
  - Facilities (e.g., office maintenance, equipment requests)
  - General Inquiry (e.g., other miscellaneous questions)
  
  Priorities:
  - High (e.g., system outage, unable to work, security issue, payroll error)
  - Medium (e.g., software bug, access request, important but not blocking)
  - Low (e.g., general question, minor issue)

  Analyze the ticket content and determine the most appropriate category and priority.
  Return only the category and priority in the specified JSON format.
  `,
});

const categorizeTicketFlow = ai.defineFlow(
  {
    name: 'categorizeTicketFlow',
    inputSchema: CategorizeTicketInputSchema,
    outputSchema: CategorizeTicketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
