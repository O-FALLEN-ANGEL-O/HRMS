'use server';

/**
 * @fileOverview An AI tool to detect payroll errors and discrepancies before processing.
 *
 * - detectPayrollErrors - A function that takes payroll data as input and flags potential errors.
 * - DetectPayrollErrorsInput - The input type for the detectPayrollErrors function.
 * - DetectPayrollErrorsOutput - The return type for the detectPayrollErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPayrollErrorsInputSchema = z.object({
  payrollData: z.string().describe('The complete payroll data in JSON format.'),
  historicalData: z.string().optional().describe("Historical payroll data for comparison (optional). JSON Format."),
});
export type DetectPayrollErrorsInput = z.infer<typeof DetectPayrollErrorsInputSchema>;

const DetectPayrollErrorsOutputSchema = z.object({
  errors: z.array(
    z.object({
      field: z.string().describe('The field with the potential error.'),
      description: z.string().describe('A description of the potential error.'),
      severity: z.enum(['high', 'medium', 'low']).describe('Severity of the error.'),
    })
  ).describe('A list of potential errors and their descriptions.'),
  summary: z.string().describe('A summary of the potential payroll errors found.'),
});
export type DetectPayrollErrorsOutput = z.infer<typeof DetectPayrollErrorsOutputSchema>;

export async function detectPayrollErrors(input: DetectPayrollErrorsInput): Promise<DetectPayrollErrorsOutput> {
  return detectPayrollErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectPayrollErrorsPrompt',
  input: {schema: DetectPayrollErrorsInputSchema},
  output: {schema: DetectPayrollErrorsOutputSchema},
  prompt: `You are an expert payroll auditor. Your job is to review payroll data and identify any potential errors or discrepancies before the payroll is processed.

  Here's the payroll data you need to review (in JSON format):
  ```json
  {{{payrollData}}}
  ```

  {{#if historicalData}}
  Here's some historical payroll data for comparison (in JSON format). Use it to help detect anomalies:
  ```json
  {{{historicalData}}}
  ```
  {{/if}}

  Identify any potential errors, and explain why you believe each one is an error. Be specific and provide context. Classify the severity of each error as high, medium, or low.

  Return the errors in the format described in the output schema. Also provide a summary of the errors.
`,
});

const detectPayrollErrorsFlow = ai.defineFlow(
  {
    name: 'detectPayrollErrorsFlow',
    inputSchema: DetectPayrollErrorsInputSchema,
    outputSchema: DetectPayrollErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
