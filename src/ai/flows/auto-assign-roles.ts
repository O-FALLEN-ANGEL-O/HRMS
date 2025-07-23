'use server';

/**
 * @fileOverview An AI agent that suggests a role for a new user based on their department and job title.
 *
 * - autoAssignRoles - A function that handles the role assignment process.
 * - AutoAssignRolesInput - The input type for the autoAssignRoles function.
 * - AutoAssignRolesOutput - The return type for the autoAssignRoles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoAssignRolesInputSchema = z.object({
  department: z.string().describe('The department of the new user.'),
  jobTitle: z.string().describe('The job title of the new user.'),
});
export type AutoAssignRolesInput = z.infer<typeof AutoAssignRolesInputSchema>;

const AutoAssignRolesOutputSchema = z.object({
  suggestedRole: z.string().describe('The suggested role for the new user based on their department and job title.'),
});
export type AutoAssignRolesOutput = z.infer<typeof AutoAssignRolesOutputSchema>;

export async function autoAssignRoles(input: AutoAssignRolesInput): Promise<AutoAssignRolesOutput> {
  return autoAssignRolesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoAssignRolesPrompt',
  input: {schema: AutoAssignRolesInputSchema},
  output: {schema: AutoAssignRolesOutputSchema},
  prompt: `You are an expert in HR role assignment.

  Based on the department and job title provided, suggest the most appropriate role for the new user.

  Department: {{{department}}}
  Job Title: {{{jobTitle}}}

  Available Roles: Admin, HR, Manager, Employee, Recruiter, Guest.
  Return only the suggested role.
  `,
});

const autoAssignRolesFlow = ai.defineFlow(
  {
    name: 'autoAssignRolesFlow',
    inputSchema: AutoAssignRolesInputSchema,
    outputSchema: AutoAssignRolesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
