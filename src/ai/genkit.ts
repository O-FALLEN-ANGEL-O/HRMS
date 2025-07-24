import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {defineDotprompt} from 'genkit/dotprompt';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: process.env.GEMINI_API_KEY,
    }),
    firebase(),
    ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
