/**
 * Speech-to-Text Provider (Disabled)
 *
 * IMPORTANT:
 * STT is now handled entirely in the browser using the Web Speech API.
 * The backend no longer performs any audio transcription.
 *
 * This file exists only to satisfy legacy imports so the server can compile.
 */

import { logger } from '../utils/logger';

/**
 * Dummy STT function.
 * Always returns an empty string because transcription
 * is performed client-side in the browser.
 */
export async function speechToText(_audioBuffer: Buffer): Promise<string> {
    logger.warn('speechToText() called, but STT is browser-side. Ignoring audio.');
    return '';
}
