/**
 * Conversation Reflection Generator
 * 
 * Uses the existing AI provider to generate supportive reflections
 * summarizing the emotional tone of a conversation.
 * 
 * Callable manually — NOT hooked into sessionManager.
 */

import { getAIReply } from '../ai/ai.factory';
import { storeReflection } from './userState.service';
import { logger } from '../utils/logger';

/**
 * Generate a conversation reflection for a user based on recent messages.
 * 
 * @param userId - The user's ID
 * @param recentMessages - Array of recent message strings from the conversation
 * @returns The stored reflection record
 */
export async function generateConversationReflection(
    userId: string,
    recentMessages: string[]
) {
    const conversationText = recentMessages.join('\n');

    const prompt = `You are a thoughtful, empathetic companion. Based on the following recent conversation messages, write a 3-4 line supportive reflection summarizing the emotional tone. Be warm, validating, and encouraging. Do not give advice — just reflect back what you observe.

Messages:
${conversationText}

Reflection:`;

    try {
        const reflection = await getAIReply(prompt);
        const stored = await storeReflection(userId, reflection);
        logger.info('Conversation reflection generated', { userId, reflectionId: stored.id });
        return stored;
    } catch (error) {
        logger.error('Failed to generate conversation reflection', { userId, error });
        throw error;
    }
}
