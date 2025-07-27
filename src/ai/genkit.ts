import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {defineDotprompt} from 'genkit/dotprompt';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    googleAI(),
    ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
