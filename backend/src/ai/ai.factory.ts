/**
 * AI Reply Service
 * Single provider: Cerebras
 * This project no longer supports multi-provider routing.
 */

import { generateLlamaReply } from './providers/llama.provider';
import { logger } from '../utils/logger';

/**
 * Sends user message to the assistant brain (Cerebras / Llama)
 * @param message User text
 * @returns Assistant reply
 */
export async function getAIReply(message: string): Promise<string> {
    logger.info('AI: generating reply via Cerebras');

    try {
        const reply = await generateLlamaReply(message);

        if (!reply || reply.trim().length === 0) {
            logger.warn('AI returned empty response');
            return "I'm here with you. Tell me a little more about what's on your mind.";
        }

        return reply;
    } catch (error) {
        logger.error('AI reply failed', { error });

        return "I’m having a small connection issue right now, but I’m still here with you. Try speaking again.";
    }
}
