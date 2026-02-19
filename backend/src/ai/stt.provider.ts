/**
 * Google Cloud Speech-to-Text Provider
 * Converts audio buffer to text using Google Cloud Speech-to-Text API.
 */

import { SpeechClient } from '@google-cloud/speech';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Internal implementation without timeout (wrapped by abstraction layer)
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Convert audio to text using Google Cloud Speech-to-Text
 * @param audioBuffer - Audio data as Buffer
 * @returns Transcribed text
 */
export async function speechToText(audioBuffer: Buffer): Promise<string> {
    try {
        const client = new SpeechClient({
            projectId: env.googleProjectId,
            keyFilename: env.googleApplicationCredentials,
        });

        const audio = {
            content: audioBuffer.toString('base64'),
        };

        const config = {
            encoding: 'LINEAR16' as const,
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };

        const request = {
            audio,
            config,
        };

        const [response] = await client.recognize(request);
        const transcription = response.results
            ?.map((result: any) => result.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join('\n');

        if (!transcription) {
            logger.warn('Google STT: empty transcription');
            return '';
        }

        return transcription;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Google STT: request failed', { error: errorMessage });
        throw new Error('Speech-to-text conversion failed');
    }
}
