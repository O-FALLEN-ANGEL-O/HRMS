
'use server';

/**
 * @fileOverview An AI agent that verifies if two images of a face belong to the same person.
 *
 * - verifyFace - A function that handles the face verification process.
 * - VerifyFaceInput - The input type for the verifyFace function.
 * - VerifyFaceOutput - The return type for the verifyFace function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const VerifyFaceInputSchema = z.object({
  profileImageUri: z
    .string()
    .describe(
      "The reference profile image of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  captureImageUri: z
    .string()
    .describe(
      "The newly captured image of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyFaceInput = z.infer<typeof VerifyFaceInputSchema>;

export const VerifyFaceOutputSchema = z.object({
  isSamePerson: z.boolean().describe('Whether the two faces belong to the same person.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence score of the verification, from 0.0 to 1.0.'),
  reasoning: z
    .string()
    .describe(
      'A brief explanation for the decision, especially if verification fails (e.g., "Different facial structure", "Low light conditions").'
    ),
});
export type VerifyFaceOutput = z.infer<typeof VerifyFaceOutputSchema>;


export async function verifyFace(input: VerifyFaceInput): Promise<VerifyFaceOutput> {
  return verifyFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyFacePrompt',
  input: { schema: VerifyFaceInputSchema },
  output: { schema: VerifyFaceOutputSchema },
  prompt: `You are an expert facial recognition system. Your task is to determine if two images show the same person.

  Analyze the two images provided:
  1.  **Reference Profile Photo:** This is the trusted, stored image of the user.
  2.  **Live Capture Photo:** This is the image just captured from the camera.

  Compare key facial features (eyes, nose, mouth, jawline, etc.). Account for minor variations in lighting, angle, and expression.

  - If you are confident they are the same person, set 'isSamePerson' to true and provide a high confidence score (e.g., > 0.8).
  - If you are confident they are different people, set 'isSamePerson' to false and provide a low confidence score (e.g., < 0.2).
  - If you are uncertain due to poor quality, obstruction, or other factors, set 'isSamePerson' to false and provide a medium confidence score and clear reasoning.

  Reference Profile Photo:
  {{media url=profileImageUri}}

  Live Capture Photo:
  {{media url=captureImageUri}}

  Return your analysis in the specified JSON format.
  `,
});

const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async (input) => {
    // In a real-world scenario, you might add more logic here, like checking image quality before sending to the LLM.
    const { output } = await prompt(input);
    return output!;
  }
);
