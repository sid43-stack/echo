/**
 * OpenAI Chat Provider
 * Uses OpenAI GPT-4.1 for chat completions.
 * Handles errors gracefully with fallback messages.
 */

import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const DEFAULT_SYSTEM_CONTEXT =
    'You are a calm, empathetic AI companion. Keep responses concise and supportive.';

/**
 * Generate a chat reply using OpenAI GPT-4.1
 * @param message - User message to send to the AI
 * @returns Assistant's text response
 */
export async function generateChatReply(message: string): Promise<string> {
    try {
        const openai = new OpenAI({
            apiKey: env.openaiApiKey,
        });

        const completion = await openai.chat.completions.create({
            model: env.openaiModel,
            messages: [
                { role: 'system', content: DEFAULT_SYSTEM_CONTEXT },
                { role: 'user', content: message },
            ],
            max_tokens: 512,
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content?.trim();

        // Log token usage for cost monitoring (server-side only)
        if (completion.usage) {
            logger.info('OpenAI: token usage', {
                totalTokens: completion.usage.total_tokens,
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
            });
        }

        if (!reply) {
            logger.warn('OpenAI: empty response', { message });
            return fallbackResponse();
        }

        return reply;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('OpenAI: request failed', { error: errorMessage });
        return fallbackResponse();
    }
}

function fallbackResponse(): string {
    return "I'm here. Something went wrong on my side—please try again in a moment.";
}
