'use server';

import { categorizeTicket, type CategorizeTicketInput, type CategorizeTicketOutput } from '@/ai/flows/categorize-ticket';

export async function categorizeTicketAction(input: CategorizeTicketInput): Promise<CategorizeTicketOutput> {
  return await categorizeTicket(input);
}
