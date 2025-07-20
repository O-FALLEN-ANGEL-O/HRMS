/**
 * @fileOverview Types for the verify-face flow.
 * 
 * - VerifyFaceInput - The input type for the verifyFace function.
 * - VerifyFaceOutput - The return type for the verifyFace function.
 * - VerifyFaceInputSchema - The Zod schema for the input.
 * - VerifyFaceOutputSchema - The Zod schema for the output.
 */
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
