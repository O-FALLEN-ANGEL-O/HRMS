import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {defineDotprompt} from 'genkit/dotprompt';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: process.env.GEMINI_API_KEY,
    }),
    ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
