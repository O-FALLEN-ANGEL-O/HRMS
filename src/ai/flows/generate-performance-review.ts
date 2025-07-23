'use server';

/**
 * @fileOverview An AI agent that generates a performance review summary.
 *
 * - generatePerformanceReview - A function that handles the performance review generation process.
 * - GeneratePerformanceReviewInput - The input type for the generatePerformanceReview function.
 * - GeneratePerformanceReviewOutput - The return type for the generatePerformanceReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerformanceReviewInputSchema = z.object({
  employeeName: z.string().describe("The employee's full name."),
  jobTitle: z.string().describe("The employee's job title."),
  goals: z.string().describe("A summary of the employee's goals for the review period."),
  achievements: z.string().describe("A summary of the employee's key achievements."),
  areasForImprovement: z.string().describe("A summary of areas where the employee can improve."),
});
export type GeneratePerformanceReviewInput = z.infer<typeof GeneratePerformanceReviewInputSchema>;

const GeneratePerformanceReviewOutputSchema = z.object({
  reviewSummary: z.string().describe('A well-structured performance review summary.'),
  suggestedRating: z
    .enum(['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'])
    .describe('A suggested overall performance rating.'),
});
export type GeneratePerformanceReviewOutput = z.infer<typeof GeneratePerformanceReviewOutputSchema>;

export async function generatePerformanceReview(
  input: GeneratePerformanceReviewInput
): Promise<GeneratePerformanceReviewOutput> {
  return generatePerformanceReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePerformanceReviewPrompt',
  input: {schema: GeneratePerformanceReviewInputSchema},
  output: {schema: GeneratePerformanceReviewOutputSchema},
  prompt: `You are an expert HR Manager tasked with writing a fair and balanced performance review.

  Employee Details:
  - Name: {{{employeeName}}}
  - Job Title: {{{jobTitle}}}

  Review Information:
  - Goals: {{{goals}}}
  - Achievements: {{{achievements}}}
  - Areas for Improvement: {{{areasForImprovement}}}

  Based on the information provided, please do the following:
  1.  Write a comprehensive and constructive performance review summary. The summary should be professional, well-structured, and provide clear feedback. Start with achievements and then constructively address areas for improvement.
  2.  Suggest an overall performance rating from the following options: 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'. Base your suggestion on the balance of achievements versus areas for improvement.
  
  Return the output as per the defined output schema.`,
});

const generatePerformanceReviewFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReviewFlow',
    inputSchema: GeneratePerformanceReviewInputSchema,
    outputSchema: GeneratePerformanceReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
