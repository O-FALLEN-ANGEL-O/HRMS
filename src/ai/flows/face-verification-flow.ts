'use server';

/**
 * @fileOverview An AI agent that verifies if two images of a face belong to the same person.
 * This flow is a duplicate of verify-face.ts and can be used for separate verification logic if needed.
 *
 * - faceVerificationFlow - A function that handles the face verification process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const FaceVerificationInputSchema = z.object({
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
export type FaceVerificationInput = z.infer<typeof FaceVerificationInputSchema>;

export const FaceVerificationOutputSchema = z.object({
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
export type FaceVerificationOutput = z.infer<typeof FaceVerificationOutputSchema>;


const prompt = ai.definePrompt({
  name: 'faceVerificationPrompt',
  input: { schema: FaceVerificationInputSchema },
  output: { schema: FaceVerificationOutputSchema },
  prompt: `You are an expert facial recognition system. Your task is to determine if two images show the same person.

  Analyze the two images provided:
  1.  **Reference Profile Photo:** This is the trusted, stored image of the user.
  2.  **Live Capture Photo:** This is the image just captured from the camera.

  Reference Profile Photo:
  {{media url=profileImageUri}}

  Live Capture Photo:
  {{media url=captureImageUri}}

  Compare key facial features (eyes, nose, mouth, jawline, etc.). Account for minor variations in lighting, angle, and expression.

  - If you are confident they are the same person, set 'isSamePerson' to true and provide a high confidence score (e.g., > 0.8).
  - If you are confident they are different people, set 'isSamePerson' to false and provide a low confidence score (e.g., < 0.2).
  - If you are uncertain due to poor quality, obstruction, or other factors, set 'isSamePerson' to false and provide a medium confidence score and clear reasoning.

  Return your analysis as per the output schema.
  `,
});

export const faceVerificationFlow = ai.defineFlow(
  {
    name: 'faceVerificationFlow',
    inputSchema: FaceVerificationInputSchema,
    outputSchema: FaceVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
