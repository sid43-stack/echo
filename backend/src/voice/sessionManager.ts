/**
 * Voice Session Manager
 * Manages conversational turn-taking and state for voice interactions.
 * TTS is handled entirely by the browser (Web Speech API).
 */

import { getAIReply } from '../ai/ai.factory';
import { logger } from '../utils/logger';

let ACTIVE_VOICE_USER: string | null = null;

export function setActiveVoiceUser(userId: string) {
    ACTIVE_VOICE_USER = userId;
}

export function getActiveVoiceUser(): string | null {
    return ACTIVE_VOICE_USER;
}


type SessionState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceSession {
    userId: string;
    state: SessionState;
    speechBuffer: string[];
    lastSpeechTimestamp: number;
    pendingReply?: string;
}

const sessions = new Map<string, VoiceSession>();

/**
 * Get or create session for user
 */
function getSession(userId: string): VoiceSession {
    if (!sessions.has(userId)) {
        sessions.set(userId, {
            userId,
            state: 'idle',
            speechBuffer: [],
            lastSpeechTimestamp: Date.now(),
        });
    }
    return sessions.get(userId)!;
}

/**
 * Handle incoming speech text from client.
 * Returns text-only reply — browser handles TTS.
 */
export async function handleVoiceInput(
    userId: string,
    text: string
): Promise<{ replyText: string }> {
    const session = getSession(userId);

    // If assistant is speaking, ignore new input (will be handled by interruption)
    if (session.state === 'speaking') {
        logger.info('Voice input ignored: assistant is speaking', { userId });
        throw new Error('Assistant is speaking');
    }

    // Update state to thinking
    session.state = 'thinking';
    session.lastSpeechTimestamp = Date.now();

    logger.info('Voice input received', { userId, text, state: session.state });

    try {
        // Get AI response
        const replyText = await getAIReply(text);
        logger.info('AI reply generated', { userId, replyLength: replyText.length });

        // Update session state — browser will speak via Web Speech API
        session.state = 'speaking';
        session.pendingReply = replyText;

        return { replyText };
    } catch (error) {
        session.state = 'listening';
        throw error;
    }
}

/**
 * Mark assistant as finished speaking.
 * Called when browser speechSynthesis.onend fires.
 */
export function finishSpeaking(userId: string): void {
    const session = getSession(userId);
    session.state = 'listening';
    logger.info('Assistant finished speaking', { userId });
}

/**
 * Interrupt assistant if user speaks during response.
 * Resets to listening state.
 */
export function interruptAssistant(userId: string): void {
    const session = getSession(userId);
    if (session.state === 'speaking') {
        logger.info('Assistant interrupted by user', { userId });
        session.state = 'listening';
    }
}

/**
 * Start speech capture for typing mode (chat mic button)
 * Placeholder — browser-side STT now handles capture directly.
 */
export async function startTypingCapture(userId: string): Promise<string> {
    logger.info('Starting typing capture', { userId });

    // Placeholder: browser speech recognition handles capture client-side
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Sample captured text');
        }, 2000);
    });
}

/**
 * Get current session state
 */
export async function getSessionState(userId: string): Promise<SessionState> {
    const { setActiveVoiceUser } = await import('../voice/sessionManager');
    setActiveVoiceUser(userId);
    const session = getSession(userId);
    return session.state;
}

/**
 * Get pending reply text for frontend polling.
 * Clears after retrieval (one-time delivery).
 */
export function getPendingReply(userId: string): string | undefined {
    const session = getSession(userId);
    const reply = session.pendingReply;

    if (reply) {
        session.pendingReply = undefined;
    }

    return reply;
}

/**
 * Reset session
 */
export function resetSession(userId: string): void {
    sessions.delete(userId);
    logger.info('Session reset', { userId });
}
