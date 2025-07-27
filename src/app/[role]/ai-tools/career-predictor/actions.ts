
'use server';

import { predictCareerPath, type PredictCareerPathInput, type PredictCareerPathOutput } from "@/ai/flows/predict-career-path";

export async function predictCareerPathAction(input: PredictCareerPathInput): Promise<PredictCareerPathOutput> {
    return await predictCareerPath(input);
}
