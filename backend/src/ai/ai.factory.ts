/**
 * AI Provider Factory
 * Routes chat requests to the appropriate AI provider based on environment configuration.
 */

import { env } from '../config/env';
import { generateChatReply } from './chat.provider';
import { generateLlamaReply } from './providers/llama.provider';
import { logger } from '../utils/logger';

/**
 * Get AI reply using the configured provider
 * @param message - User message to send to the AI
 * @returns Assistant's text response
 */
export async function getAIReply(message: string): Promise<string> {
    const provider = env.aiProvider.toLowerCase();

    logger.info('AI Factory: routing request', { provider });

    switch (provider) {
        case 'openai':
            return generateChatReply(message);
        case 'llama':
            return generateLlamaReply(message);
        default:
            logger.warn('AI Factory: unknown provider, defaulting to OpenAI', { provider });
            return generateChatReply(message);
    }
}
