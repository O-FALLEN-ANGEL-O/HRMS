
'use server';
/**
 * @fileOverview AI agent for automatically generating personalized welcome emails for new hires.
 *
 * - autoGenerateWelcomeEmail - A function that generates personalized welcome emails.
 * - AutoGenerateWelcomeEmailInput - The input type for the autoGenerateWelcomeEmail function.
 * - AutoGenerateWelcomeEmailOutput - The return type for the autoGenerateWelcomeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGenerateWelcomeEmailInputSchema = z.object({
  firstName: z.string().describe('The first name of the new hire.'),
  lastName: z.string().describe('The last name of the new hire.'),
  jobTitle: z.string().describe('The job title of the new hire.'),
  department: z.string().describe('The department the new hire is joining.'),
  startDate: z.string().describe('The start date of the new hire (YYYY-MM-DD).'),
  teamMembers: z.string().describe('A list of the new hire’s team members.'),
  companyName: z.string().describe('The name of the company.'),
  companyCultureValues: z.string().describe('A brief description of the company culture and values.'),
  hrContactName: z.string().describe('The name of the HR contact person.'),
  hrContactEmail: z.string().describe('The email address of the HR contact person.'),
});
export type AutoGenerateWelcomeEmailInput = z.infer<typeof AutoGenerateWelcomeEmailInputSchema>;

const AutoGenerateWelcomeEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the welcome email.'),
  body: z.string().describe('The personalized body of the welcome email.'),
});
export type AutoGenerateWelcomeEmailOutput = z.infer<typeof AutoGenerateWelcomeEmailOutputSchema>;

export async function autoGenerateWelcomeEmail(input: AutoGenerateWelcomeEmailInput): Promise<AutoGenerateWelcomeEmailOutput> {
  return autoGenerateWelcomeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGenerateWelcomeEmailPrompt',
  input: {schema: AutoGenerateWelcomeEmailInputSchema},
  output: {schema: AutoGenerateWelcomeEmailOutputSchema},
  prompt: `You are an expert HR assistant. Your task is to generate a personalized welcome email for a new hire.

  Here is the new hire's information:
  - First Name: {{{firstName}}}
  - Last Name: {{{lastName}}}
  - Job Title: {{{jobTitle}}}
  - Department: {{{department}}}
  - Start Date: {{{startDate}}}
  - Team Members: {{{teamMembers}}}

  Here is the company's information:
  - Company Name: {{{companyName}}}
  - Company Culture Values: {{{companyCultureValues}}}

  Here is the HR contact information:
  - HR Contact Name: {{{hrContactName}}}
  - HR Contact Email: {{{hrContactEmail}}}

  Please generate a welcome email that includes:
  - A warm and welcoming tone.
  - Specific details about the new hire's role and department.
  - Information about the company culture and values.
  - Contact information for the HR contact person.

  The welcome email subject should be concise and inviting.
  Ensure that the generated email is professional and grammatically correct.
  Return only the subject and body of the email as per the output schema.
  `,
});

const autoGenerateWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'autoGenerateWelcomeEmailFlow',
    inputSchema: AutoGenerateWelcomeEmailInputSchema,
    outputSchema: AutoGenerateWelcomeEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
