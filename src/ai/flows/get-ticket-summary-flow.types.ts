/**
 * @fileOverview Types and schemas for the getTicketSummary flow.
 * 
 * - TicketData - The return type for the getTicketSummaryAction function.
 * - TicketDataSchema - The Zod schema for the ticket summary data.
 */
import { z } from 'genkit';

const TicketSummarySchema = z.array(z.object({
  category: z.string().describe('The name of the ticket category.'),
  count: z.number().describe('The number of tickets in this category.'),
}));

export const TicketDataSchema = z.object({
  ticketSummary: TicketSummarySchema,
});

export type TicketData = z.infer<typeof TicketDataSchema>;
