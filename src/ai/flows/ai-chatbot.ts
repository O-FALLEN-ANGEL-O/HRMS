
'use server';
/**
 * @fileOverview An AI-powered chatbot for answering HR-related questions.
 * 
 * - aiChatbot - A function that handles the chatbot conversation.
 * - AiChatbotInput - The input type for the aiChatbot function.
 * - AiChatbotOutput - The return type for the aiChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Message, Part } from 'genkit/experimental/ai';

const AiChatbotInputSchema = z.object({
  history: z.array(z.custom<Message>()).describe("The history of the conversation so far."),
  query: z.string().describe("The user's latest query."),
});
export type AiChatbotInput = z.infer<typeof AiChatbotInputSchema>;

const AiChatbotOutputSchema = z.string().describe("The chatbot's response.");
export type AiChatbotOutput = z.infer<typeof AiChatbotOutputSchema>;

export async function aiChatbot(input: AiChatbotInput): Promise<AiChatbotOutput> {
  return aiChatbotFlow(input);
}

const systemPrompt = `You are a friendly and helpful HR assistant chatbot for a company called OptiTalent.

Your goal is to answer employee questions about company policies, benefits, leave requests, and other HR-related topics.
Be concise and clear in your answers.

Use the conversation history to maintain context.

If you don't know the answer to a question, politely state that you don't have that information and suggest contacting the HR department directly at hr@optitalent.com.
`;

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AiChatbotInputSchema,
    outputSchema: AiChatbotOutputSchema,
  },
  async ({ history, query }) => {
    const systemMessage: Message = {
        role: 'system',
        content: [{ text: systemPrompt }]
    };

    const llmResponse = await ai.generate({
      prompt: query,
      history: [systemMessage, ...history],
    });

    return llmResponse.text;
  }
);
