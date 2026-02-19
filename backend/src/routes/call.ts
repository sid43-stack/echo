import { Router, Request, Response } from 'express';
import {
  startCall,
  endCall,
  getCallStatus,
  getCallLogs,
} from '../engines/callEngine';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/start', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const session = await startCall(userId);
    res.status(201).json(session);
  } catch (error) {
    logger.error('Call start error', { error, userId });
    res.status(500).json({ error: 'Failed to start call' });
  }
});

router.post('/end', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { callId } = req.body as { callId?: unknown };

  if (typeof callId !== 'string' || callId.trim() === '') {
    res.status(400).json({ error: 'callId is required' });
    return;
  }

  try {
    const session = await endCall(userId, callId);
    if (!session) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    logger.error('Call end error', { error, userId });
    res.status(500).json({ error: 'Failed to end call' });
  }
});

router.get('/status/:callId', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { callId } = req.params;

  if (!callId || typeof callId !== 'string') {
    res.status(400).json({ error: 'callId is required' });
    return;
  }

  try {
    const session = await getCallStatus(userId, callId);
    if (!session) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    logger.error('Call status error', { error, userId });
    res.status(500).json({ error: 'Failed to get call status' });
  }
});

router.get('/logs', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await getCallLogs(userId, limit);
    res.status(200).json(logs);
  } catch (error) {
    logger.error('Call logs error', { error, userId });
    res.status(500).json({ error: 'Failed to get call logs' });
  }
});

export default router;
