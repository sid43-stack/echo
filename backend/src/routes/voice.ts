/**
 * Voice Routes
 * Handles voice interactions with Browser Speech Recognition
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { getActiveVoiceUser, handleVoiceInput, startTypingCapture } from '../voice/sessionManager';

const router: Router = Router();

/**
 * POST /voice/input
 * Receives recognized speech text from browser speech recognition (or legacy internal service)
 * Processes through conversational pipeline: Text → AI (Text only)
 *
 * Auth: accepts JWT (Authorization: Bearer) OR x-internal-key header
 */
router.post('/input', async (req: Request, res: Response) => {
    let userId: string | null = null;

    // --- Auth path 1: JWT from browser client ---
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, env.jwtSecret) as { id: string; email: string };
            const activeUser = getActiveVoiceUser();
            if (!activeUser || activeUser !== decoded.id) {
                return res.status(409).json({ error: "No active voice session" });
            }

            userId = activeUser;

        } catch {
            // JWT present but invalid — fall through to internal key check
        }
    }

    // --- Auth path 2: x-internal-key (backward compat) ---
    if (!userId) {
        const internalKey = req.headers['x-internal-key'];
        if (internalKey && internalKey === process.env.VOSK_INTERNAL_KEY) {
            const { getActiveVoiceUser } = await import('../voice/sessionManager');
            userId = getActiveVoiceUser();
        }
    }

    // --- Reject if neither auth method succeeded ---
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text } = req.body as { text?: unknown };

    if (typeof text !== 'string' || text.trim() === '') {
        res.status(400).json({ error: 'text is required' });
        return;
    }

    try {
        const result = await handleVoiceInput(userId, text);
        res.status(200).json(result);
    } catch (error) {
        logger.error('Voice input error', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        res.status(500).json({ error: 'Failed to process voice input' });
    }
});

/**
 * POST /voice/start-typing
 * Triggers speech capture for chat mic button
 * Captures next speech segment and returns text
 */
router.post('/start-typing', authenticate, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const text = await startTypingCapture(userId);
        res.status(200).json({ text });
    } catch (error) {
        logger.error('Start typing error', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        res.status(500).json({ error: 'Failed to capture speech' });
    }
});

/**
 * GET /voice/state
 * Get current voice session state for polling
 */
router.get('/state', authenticate, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const { setActiveVoiceUser } = await import('../voice/sessionManager');
    setActiveVoiceUser(userId);

    try {
        const { getSessionState, getPendingReply } = await import('../voice/sessionManager');
        const state = await getSessionState(userId);
        const replyText = getPendingReply(userId);

        res.status(200).json({
            state,
            replyText,
        });
    } catch (error) {
        logger.error('Get voice state error', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        res.status(500).json({ error: 'Failed to get voice state' });
    }
});

/**
 * POST /voice/interrupt
 * Interrupt assistant while speaking
 */
router.post('/interrupt', authenticate, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { interruptAssistant } = await import('../voice/sessionManager');
        interruptAssistant(userId);
        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Interrupt error', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        res.status(500).json({ error: 'Failed to interrupt' });
    }
});

/**
 * POST /voice/finish-speaking
 * Notify backend that audio playback finished
 */
router.post('/finish-speaking', authenticate, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { finishSpeaking } = await import('../voice/sessionManager');
        finishSpeaking(userId);
        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Finish speaking error', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        res.status(500).json({ error: 'Failed to mark as finished' });
    }
});

export default router;
