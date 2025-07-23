'use server';

/**
 * @fileOverview Ranks candidates' resumes based on the job description.
 *
 * - scoreResume - A function that scores the resume against the job description.
 * - ScoreResumeInput - The input type for the scoreResume function.
 * - ScoreResumeOutput - The return type for the scoreResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreResumeInputSchema = z.object({
  jd: z
    .string()
    .describe('The job description for the role.'),
  resume: z.string().describe('The resume of the candidate.'),
});
export type ScoreResumeInput = z.infer<typeof ScoreResumeInputSchema>;

const ScoreResumeOutputSchema = z.object({
  score: z
    .number()
    .describe('The score (0-100) of the resume based on the job description.'),
  justification: z
    .string()
    .describe('The justification for the assigned score.'),
});
export type ScoreResumeOutput = z.infer<typeof ScoreResumeOutputSchema>;

export async function scoreResume(input: ScoreResumeInput): Promise<ScoreResumeOutput> {
  return scoreResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreResumePrompt',
  input: {schema: ScoreResumeInputSchema},
  output: {schema: ScoreResumeOutputSchema},
  prompt: `You are an expert HR recruiter.

You will be provided a job description and a resume. You will score the resume from 0-100 based on how well it matches the job description.

You will also provide a justification for the score.

Job Description: {{{jd}}}

Resume: {{{resume}}}
`,
});

const scoreResumeFlow = ai.defineFlow(
  {
    name: 'scoreResumeFlow',
    inputSchema: ScoreResumeInputSchema,
    outputSchema: ScoreResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
