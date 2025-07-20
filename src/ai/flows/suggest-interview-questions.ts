'use server';

/**
 * @fileOverview A flow to suggest role-specific interview questions.
 *
 * - suggestInterviewQuestions - A function that suggests interview questions based on the role.
 * - SuggestInterviewQuestionsInput - The input type for the suggestInterviewQuestions function.
 * - SuggestInterviewQuestionsOutput - The return type for the suggestInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterviewQuestionsInputSchema = z.object({
  role: z.string().describe('The role for which interview questions are needed.'),
});
export type SuggestInterviewQuestionsInput = z.infer<
  typeof SuggestInterviewQuestionsInputSchema
>;

const SuggestInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of suggested interview questions.'),
});
export type SuggestInterviewQuestionsOutput = z.infer<
  typeof SuggestInterviewQuestionsOutputSchema
>;

export async function suggestInterviewQuestions(
  input: SuggestInterviewQuestionsInput
): Promise<SuggestInterviewQuestionsOutput> {
  return suggestInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInterviewQuestionsPrompt',
  input: {schema: SuggestInterviewQuestionsInputSchema},
  output: {schema: SuggestInterviewQuestionsOutputSchema},
  prompt: `You are an expert HR assistant. You are asked to suggest interview questions for the role: {{{role}}}. Return an array of questions. Do not include any introduction or conclusion. Only provide the questions.
`,
});

const suggestInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestInterviewQuestionsFlow',
    inputSchema: SuggestInterviewQuestionsInputSchema,
    outputSchema: SuggestInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
