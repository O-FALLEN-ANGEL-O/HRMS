
'use server';

import { autoGenerateWelcomeEmail, type AutoGenerateWelcomeEmailInput, type AutoGenerateWelcomeEmailOutput } from "@/ai/flows/auto-generate-welcome-email";

export async function autoGenerateWelcomeEmailAction(input: AutoGenerateWelcomeEmailInput): Promise<AutoGenerateWelcomeEmailOutput> {
    return await autoGenerateWelcomeEmail(input);
}
