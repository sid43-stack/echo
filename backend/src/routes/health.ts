import { Router, Request, Response } from 'express';
import { HealthPayload } from '../types/health';
import { processHealthPayload } from '../engines/healthEngine';

const router: Router = Router();

/**
 * Health check endpoint
 * Returns server status and basic info
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * POST /health/ingest
 * Accepts health payload, updates in-memory state, and returns signal
 */
router.post('/health/ingest', (req: Request, res: Response) => {
  const payload = req.body as HealthPayload;

  if (!payload || typeof payload.userId !== 'string' || payload.userId.trim() === '') {
    res.status(400).json({ ok: false, error: 'userId is required' });
    return;
  }

  if (payload.source !== 'watch' && payload.source !== 'phone' && payload.source !== 'manual') {
    res.status(400).json({ ok: false, error: 'source is invalid' });
    return;
  }

  if (payload.heartRate) {
    const { bpm, timestamp } = payload.heartRate;
    if (typeof bpm !== 'number' || !Number.isFinite(bpm)) {
      res.status(400).json({ ok: false, error: 'heartRate.bpm must be a number' });
      return;
    }
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
      res.status(400).json({ ok: false, error: 'heartRate.timestamp must be a number' });
      return;
    }
  }

  const result = processHealthPayload(payload);

  res.status(200).json({
    ok: true,
    result,
  });
});

export default router;

