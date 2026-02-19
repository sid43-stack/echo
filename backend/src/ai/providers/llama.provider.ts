/**
 * Cerebras LLaMA Provider
 * Uses Cerebras LLaMA-3.1-8B for chat completions.
 * Handles errors gracefully with fallback messages.
 */

import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const SYSTEM_PROMPT =
    'You are Echo, a calm and empathetic AI companion focused on emotional support and well-being. Keep responses concise, supportive, and compassionate.';

/**
 * Generate a chat reply using Cerebras LLaMA-3.1-8B
 * @param message - User message to send to the AI
 * @returns Assistant's text response
 */
export async function generateLlamaReply(message: string): Promise<string> {
    try {
        const client = new Cerebras({
            apiKey: env.cerebrasApiKey,
        });

        const completion = await client.chat.completions.create({
            model: 'llama3.1-8b',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message },
            ],
            max_completion_tokens: 512,
            temperature: 0.6,
            stream: false,
        });

        // Type assertion for Cerebras SDK response
        const reply = (completion as any).choices?.[0]?.message?.content?.trim();

        if (!reply) {
            logger.warn('Cerebras LLaMA: empty response', { message });
            return fallbackResponse();
        }

        return reply;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Cerebras LLaMA: request failed', { error: errorMessage });
        return fallbackResponse();
    }
}

function fallbackResponse(): string {
    return "I'm here for you. Something went wrong on my end—please try again in a moment.";
}
