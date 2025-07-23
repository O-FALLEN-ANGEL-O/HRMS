'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting employee burnout risk.
 *
 * - predictBurnout - Predicts the burnout risk for an employee.
 * - PredictBurnoutInput - The input type for the predictBurnout function.
 * - PredictBurnoutOutput - The return type for the predictBurnout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictBurnoutInputSchema = z.object({
  employeeFeedback: z
    .string()
    .describe('Recent feedback from the employee (performance reviews, surveys, 1:1 meetings).'),
  workload: z.string().describe('Description of the employee’s current workload and responsibilities.'),
  workEnvironment: z
    .string()
    .describe('Description of the employee’s work environment, including team dynamics and company culture.'),
  attendanceRecords: z
    .string()
    .describe('Summary of the employee’s attendance records, including overtime and absences.'),
});
export type PredictBurnoutInput = z.infer<typeof PredictBurnoutInputSchema>;

const PredictBurnoutOutputSchema = z.object({
  burnoutRiskLevel: z
    .string()
    .describe(
      'The predicted burnout risk level for the employee (Low, Medium, High, Critical).'
    ),
  riskFactors: z.array(z.string()).describe('Key factors contributing to the burnout risk.'),
  recommendations: z
    .array(z.string())
    .describe('Recommended actions for managers to address the burnout risk.'),
});
export type PredictBurnoutOutput = z.infer<typeof PredictBurnoutOutputSchema>;

export async function predictBurnout(input: PredictBurnoutInput): Promise<PredictBurnoutOutput> {
  return predictBurnoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictBurnoutPrompt',
  input: {schema: PredictBurnoutInputSchema},
  output: {schema: PredictBurnoutOutputSchema},
  prompt: `You are an HR expert specializing in employee well-being and burnout prevention.

  Based on the information provided, analyze the employee's burnout risk and provide recommendations for managers.

  Employee Feedback: {{{employeeFeedback}}}
  Workload: {{{workload}}}
  Work Environment: {{{workEnvironment}}}
  Attendance Records: {{{attendanceRecords}}}

  Consider factors such as workload, work-life balance, stress levels, and overall job satisfaction.
  Determine the burnout risk level (Low, Medium, High, Critical) and list the key factors contributing to the risk.
  Provide specific and actionable recommendations for managers to support the employee and reduce burnout risk.
  Ensure your output matches the schema exactly.
  `,
});

const predictBurnoutFlow = ai.defineFlow(
  {
    name: 'predictBurnoutFlow',
    inputSchema: PredictBurnoutInputSchema,
    outputSchema: PredictBurnoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
