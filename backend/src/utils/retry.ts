/**
 * Retry mechanism for AI provider calls.
 * Implements single retry on failure.
 */

import { logger } from './logger';

export interface RetryOptions {
    maxRetries?: number;
    operationName?: string;
}

/**
 * Retry a promise-returning function on failure.
 * @param fn - Function that returns a promise
 * @param options - Retry configuration
 * @returns Promise result from successful attempt
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 1, operationName = 'operation' } = options;

    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (attempt < maxRetries) {
                logger.warn(`${operationName}: retry attempt ${attempt + 1}/${maxRetries}`, {
                    error: errorMessage,
                });
            } else {
                logger.error(`${operationName}: all retry attempts failed`, {
                    error: errorMessage,
                    attempts: attempt + 1,
                });
            }
        }
    }

    throw lastError;
}
