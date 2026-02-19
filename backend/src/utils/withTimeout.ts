/**
 * Timeout wrapper utility for AI provider calls.
 * Uses Promise.race to enforce maximum execution time.
 */

export class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

/**
 * Wrap a promise with a timeout.
 * @param promise - Promise to wrap
 * @param ms - Timeout in milliseconds
 * @returns Promise that rejects if timeout is exceeded
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    ms: number
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Operation timed out after ${ms}ms`));
        }, ms);
    });

    return Promise.race([promise, timeoutPromise]);
}
