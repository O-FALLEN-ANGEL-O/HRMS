
'use server';

import { generatePerformanceReview, type GeneratePerformanceReviewInput, type GeneratePerformanceReviewOutput } from "@/ai/flows/generate-performance-review";

export async function generatePerformanceReviewAction(input: GeneratePerformanceReviewInput): Promise<GeneratePerformanceReviewOutput> {
    return await generatePerformanceReview(input);
}
