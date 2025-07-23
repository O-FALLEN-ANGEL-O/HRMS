
'use server';

import { aiChatbot } from '@/ai/flows/ai-chatbot';
import type { AiChatbotInput } from '@/ai/flows/ai-chatbot';

export async function getChatbotResponse(input: AiChatbotInput) {
    return await aiChatbot(input);
}
