
'use server';

/**
 * @fileOverview An AI agent that predicts a potential career path for an employee.
 *
 * - predictCareerPath - A function that handles the career path prediction.
 * - PredictCareerPathInput - The input type for the predictCareerPath function.
 * - PredictCareerPathOutput - The return type for the predictCareerPath function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PredictCareerPathInputSchema = z.object({
  currentRole: z.string().describe("The employee's current job title."),
  skills: z.array(z.string()).describe("A list of the employee's current skills."),
  performanceSummary: z.string().describe("A summary of the employee's recent performance review, highlighting strengths and areas for growth."),
});
export type PredictCareerPathInput = z.infer<typeof PredictCareerPathInputSchema>;

const CareerPathStepSchema = z.object({
  timespan: z.string().describe("The estimated time frame for this step (e.g., '1-2 years', '3-5 years')."),
  role: z.string().describe("The suggested next role in the career path."),
  rationale: z.string().describe("A brief explanation of why this role is a logical next step."),
  skills_to_develop: z.array(z.string()).describe("A list of key skills the employee should acquire for this role."),
});

export const PredictCareerPathOutputSchema = z.object({
  path: z.array(CareerPathStepSchema).describe("A list of potential career path steps over the next 5-7 years."),
});
export type PredictCareerPathOutput = z.infer<typeof PredictCareerPathOutputSchema>;

export async function predictCareerPath(input: PredictCareerPathInput): Promise<PredictCareerPathOutput> {
  return predictCareerPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCareerPathPrompt',
  input: { schema: PredictCareerPathInputSchema },
  output: { schema: PredictCareerPathOutputSchema },
  prompt: `You are an expert HR strategist and career coach for a BPO/tech company. Your task is to generate a potential 5-7 year career path for an employee based on their profile.

  Employee Profile:
  - Current Role: {{{currentRole}}}
  - Key Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Performance Summary: {{{performanceSummary}}}

  Based on this information, create a logical and aspirational career path consisting of 2-3 steps. For each step, provide the following:
  1.  **Timespan:** A realistic timeframe for achieving this step.
  2.  **Role:** The name of the next potential job title.
  3.  **Rationale:** A brief justification for why this role is a suitable progression.
  4.  **Skills to Develop:** A list of crucial skills the employee needs to learn to succeed in that role.

  The path should be realistic for a high-performing individual in a BPO or tech environment. Return the path in the specified JSON format.
  `,
});

const predictCareerPathFlow = ai.defineFlow(
  {
    name: 'predictCareerPathFlow',
    inputSchema: PredictCareerPathInputSchema,
    outputSchema: PredictCareerPathOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
