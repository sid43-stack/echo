import { Router, Request, Response } from 'express';
import {
  sendChatMessage,
  getChatHistory,
  SafetyBlockedError,
} from '../engines/chatEngine';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

/**
 * POST /chat/send
 * Send a chat message; AI assistant responds. User-scoped.
 */
router.post('/send', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { message } = req.body as { message?: unknown };

  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    const { userMessage, assistantMessage } = await sendChatMessage(userId, message);

    res.status(200).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    if (error instanceof SafetyBlockedError) {
      res.status(403).json({
        error: error.state.reason ?? 'Request blocked',
        paused: error.state.paused,
      });
      return;
    }
    logger.error('Chat send error', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /chat/history
 * User-scoped chat history.
 */
router.get('/history', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const messages = await getChatHistory(userId, limit);

    res.status(200).json(messages);
  } catch (error) {
    logger.error('Chat history fetch failed', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

export default router;
