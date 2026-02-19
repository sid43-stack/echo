/**
 * Assistant Status Route
 * 
 * READ-ONLY endpoint that exposes the current voice assistant state.
 * Does NOT modify sessionManager — only reads from it.
 */

import { Router, Request, Response, type IRouter } from 'express';
import { getActiveVoiceUser, getSessionState } from '../voice/sessionManager';

const router: IRouter = Router();

/**
 * GET /assistant/status
 * Returns the current assistant state.
 * Public endpoint (no auth required) — read-only status.
 */
router.get('/status', async (_req: Request, res: Response) => {
    try {
        const activeUser = getActiveVoiceUser();

        if (!activeUser) {
            res.json({ state: 'idle' });
            return;
        }

        const state = await getSessionState(activeUser);
        res.json({ state });
    } catch (error) {
        // Default to idle on error — safe fallback
        res.json({ state: 'idle' });
    }
});

export default router;
