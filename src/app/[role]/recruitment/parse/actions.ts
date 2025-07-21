'use server';

/**
 * @fileOverview Server actions for the resume parsing and scoring feature.
 */

import { scoreAndParseResume, type ScoreAndParseResumeInput, type ScoreAndParseResumeOutput } from "@/ai/flows/score-and-parse-resume";
import { suggestInterviewQuestions, type SuggestInterviewQuestionsInput, type SuggestInterviewQuestionsOutput } from "@/ai/flows/suggest-interview-questions";

export async function scoreAndParseResumeAction(input: ScoreAndParseResumeInput): Promise<ScoreAndParseResumeOutput> {
  return await scoreAndParseResume(input);
}

export async function suggestInterviewQuestionsAction(input: SuggestInterviewQuestionsInput): Promise<SuggestInterviewQuestionsOutput> {
    return await suggestInterviewQuestions(input);
}
