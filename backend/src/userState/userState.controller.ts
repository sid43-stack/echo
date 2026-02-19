/**
 * User State Controller
 * Express request handlers for user state endpoints.
 */

import { Request, Response } from 'express';
import { getUserState, updateUserState, getReflections } from './userState.service';
import { logger } from '../utils/logger';

/**
 * GET /user-state/me
 * Returns the user_state record for the authenticated user.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const state = await getUserState(userId);
        res.json(state);
    } catch (error) {
        logger.error('Failed to get user state', { error });
        res.status(500).json({ error: 'Failed to get user state' });
    }
}

/**
 * POST /user-state/update-summary
 * Updates user state with mood, energy, summary, and preferredMode.
 */
export async function updateSummary(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const { mood, energy, summary, preferredMode } = req.body;

        if (!mood || !energy || !summary || !preferredMode) {
            res.status(400).json({ error: 'mood, energy, summary, and preferredMode are required' });
            return;
        }

        if (preferredMode !== 'chat' && preferredMode !== 'voice') {
            res.status(400).json({ error: 'preferredMode must be "chat" or "voice"' });
            return;
        }

        const updated = await updateUserState(userId, { mood, energy, summary, preferredMode });
        res.json(updated);
    } catch (error) {
        logger.error('Failed to update user state', { error });
        res.status(500).json({ error: 'Failed to update user state' });
    }
}

/**
 * GET /user-state/reflections
 * Returns the last 5 conversation reflections for the authenticated user.
 */
export async function getMyReflections(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const reflections = await getReflections(userId, 5);
        res.json(reflections);
    } catch (error) {
        logger.error('Failed to get reflections', { error });
        res.status(500).json({ error: 'Failed to get reflections' });
    }
}
