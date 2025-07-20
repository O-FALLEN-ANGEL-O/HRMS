'use server';

/**
 * @fileOverview An AI agent that parses a resume and scores it against a job description.
 *
 * - scoreAndParseResume - A function that handles the resume parsing and scoring process.
 * - ScoreAndParseResumeInput - The input type for the scoreAndParseResume function.
 * - ScoreAndParseResumeOutput - The return type for the scoreAndParseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreAndParseResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  resumeDataUri: z
    .string()
    .describe(
      "A resume file (PDF, DOCX) or an image of a resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScoreAndParseResumeInput = z.infer<typeof ScoreAndParseResumeInputSchema>;

const WorkExperienceSchema = z.object({
  company: z.string().describe('The name of the company.'),
  title: z.string().describe('The job title or role.'),
  dates: z.string().describe('The dates of employment.'),
});

const EducationSchema = z.object({
  institution: z.string().describe('The name of the educational institution.'),
  degree: z.string().describe('The degree or qualification obtained.'),
  year: z.string().describe('The year of graduation or completion.'),
});

const ScoreAndParseResumeOutputSchema = z.object({
  score: z
    .number()
    .describe('The score (0-100) of the resume based on the job description.'),
  justification: z
    .string()
    .describe('The justification for the assigned score.'),
  parsedData: z.object({
    name: z.string().describe("The candidate's full name."),
    email: z.string().describe("The candidate's email address."),
    phone: z.string().describe("The candidate's phone number."),
    links: z.array(z.string()).describe("Array of URLs for social profiles like LinkedIn, GitHub, etc."),
    skills: z.array(z.string()).describe('An array of skills extracted from the resume.'),
    workExperience: z.array(WorkExperienceSchema).describe('An array of work experience objects.'),
    education: z.array(EducationSchema).describe('An array of education objects.'),
  }),
});
export type ScoreAndParseResumeOutput = z.infer<typeof ScoreAndParseResumeOutputSchema>;

export async function scoreAndParseResume(input: ScoreAndParseResumeInput): Promise<ScoreAndParseResumeOutput> {
  return scoreAndParseResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreAndParseResumePrompt',
  input: {schema: ScoreAndParseResumeInputSchema},
  output: {schema: ScoreAndParseResumeOutputSchema},
  prompt: `You are an expert HR recruiter with experience in parsing resumes and matching candidates to job descriptions.

You will be provided with a job description and a resume (either as text from a document or from an image using OCR). Your tasks are:
1.  Parse the resume to extract structured information: candidate's name, email, phone, social links (LinkedIn, GitHub, etc.), skills, work experience (company, title, dates), and education (institution, degree, year).
2.  Score the resume from 0-100 based on how well the candidate's skills and experience match the provided job description.
3.  Provide a concise justification for the score.

Job Description: {{{jobDescription}}}

Resume Content:
{{media url=resumeDataUri}}

Please return the extracted data, score, and justification in the specified JSON format.
`,
});

const scoreAndParseResumeFlow = ai.defineFlow(
  {
    name: 'scoreAndParseResumeFlow',
    inputSchema: ScoreAndParseResumeInputSchema,
    outputSchema: ScoreAndParseResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
