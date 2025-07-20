
import { config } from 'dotenv';
config();

import '@/ai/flows/auto-assign-roles.ts';
import '@/ai/flows/detect-payroll-errors.ts';
import '@/ai/flows/suggest-interview-questions.ts';
import '@/ai/flows/auto-generate-welcome-email.ts';
import '@/ai/flows/predict-burnout.ts';
import '@/ai/flows/score-resume.ts';
import '@/ai/flows/generate-performance-review.ts';
import '@/ai/flows/score-and-parse-resume.ts';
import '@/ai/flows/categorize-ticket.ts';
import '@/ai/flows/verify-face.ts';
import '@/ai/flows/get-dashboard-data.ts';
import '@/ai/flows/get-ticket-summary-flow.ts';
