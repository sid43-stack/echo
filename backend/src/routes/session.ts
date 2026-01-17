import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { startSession, endSession, getSession } from '../engines/sessionManager';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /session/start
 * Protected route - requires authentication
 * Starts a new session, ends existing session if any
 * Returns session ID
 */
router.post('/start', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessionId = startSession(userId);

    logger.info('Session started', {
      userId,
      sessionId,
    });

    res.status(200).json({
      sessionId,
    });
  } catch (error) {
    logger.error('Session start error', { error });
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/**
 * POST /session/end
 * Protected route - requires authentication
 * Ends current session
 */
router.post('/end', authenticate, (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    // Verify session belongs to user
    const session = getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or expired' });
      return;
    }

    if (session.userId !== req.user?.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    endSession(sessionId);

    logger.info('Session ended', {
      userId: req.user.id,
      sessionId,
    });

    res.status(200).json({
      message: 'Session ended',
    });
  } catch (error) {
    logger.error('Session end error', { error });
    res.status(500).json({ error: 'Failed to end session' });
  }
});

export default router;

