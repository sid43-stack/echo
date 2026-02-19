/**
 * AI Provider Abstraction Layer
 * Centralizes all AI provider access with timeout and retry mechanisms.
 * Engines should import ONLY from this module.
 */

import { getAIReply } from './ai.factory';
import { speechToText as sttProviderImpl } from './stt.provider';
import { withTimeout } from '../utils/withTimeout';
import { retry } from '../utils/retry';
import { env } from '../config/env';

const AI_TIMEOUT_MS = 8000; // Default timeout for AI operations

/**
 * Generate a chat reply using configured AI provider with timeout protection.
 * @param message - User message to send to the AI
 * @returns Assistant's text response
 */
export async function generateChatReply(message: string): Promise<string> {
    const timeoutMs = env.aiTimeoutMs || AI_TIMEOUT_MS;
    return withTimeout(getAIReply(message), timeoutMs);
}

/**
 * Convert audio to text using Google Cloud STT with timeout and retry.
 * @param audioBuffer - Audio data as Buffer
 * @returns Transcribed text
 */
export async function speechToText(audioBuffer: Buffer): Promise<string> {
    const timeoutMs = env.aiTimeoutMs || AI_TIMEOUT_MS;

    return retry(
        () => withTimeout(sttProviderImpl(audioBuffer), timeoutMs),
        { maxRetries: 1, operationName: 'Google STT' }
    );
}
