
'use server';

/**
 * @fileOverview An AI agent that verifies if two images of a face belong to the same person.
 *
 * - verifyFace - A function that handles the face verification process.
 */

import { ai } from '@/ai/genkit';
import { VerifyFaceInput, VerifyFaceInputSchema, VerifyFaceOutput, VerifyFaceOutputSchema } from './verify-face.types';


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
