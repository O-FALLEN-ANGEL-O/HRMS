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
  dates: z.string().describe('The dates of employment (e.g., "Jan 2020 - Present").'),
});

const EducationSchema = z.object({
  institution: z.string().describe('The name of the educational institution.'),
  degree: z.string().describe('The degree or qualification obtained.'),
  year: z.string().describe('The year of graduation or completion.'),
});

const ScoreAndParseResumeOutputSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe('The score (0-100) of the resume based on the job description.'),
  justification: z
    .string()
    .describe('A concise justification for the assigned score, highlighting key strengths and weaknesses.'),
  parsedData: z.object({
    name: z.string().describe("The candidate's full name."),
    email: z.string().describe("The candidate's email address.").optional(),
    phone: z.string().describe("The candidate's phone number.").optional(),
    links: z.array(z.string()).describe("Array of URLs for social profiles like LinkedIn, GitHub, personal website, etc."),
    skills: z.array(z.string()).describe('An array of key skills extracted from the resume.'),
    workExperience: z.array(WorkExperienceSchema).describe('An array of work experience objects.'),
    education: z.array(EducationSchema).describe('An array of education objects.'),
    certifications: z.array(z.string()).describe('An array of relevant certifications.'),
    languages: z.array(z.string()).describe('An array of languages spoken by the candidate.'),
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
1.  Parse the resume to extract structured information. Be as accurate as possible. Extract the following fields:
    - Candidate's full name.
    - Contact info: email and phone number.
    - Social and professional links (e.g., LinkedIn, GitHub, portfolio).
    - A list of key skills (both technical and soft skills).
    - A list of work experiences, including company, job title, and employment dates.
    - A list of educational qualifications, including institution, degree, and year.
    - A list of any certifications mentioned.
    - A list of languages spoken.
2.  Score the resume from 0 to 100 based on how well the candidate's skills and experience match the provided job description.
3.  Provide a concise justification for the score. Explain the reasoning behind your score, noting how the candidate aligns with the requirements.

Job Description:
\`\`\`
{{{jobDescription}}}
\`\`\`

Resume Content:
{{media url=resumeDataUri}}

Please return the extracted data, score, and justification in the specified JSON format. If a field is not present in the resume, return an empty string or array for it.
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
