import { Router, Request, Response } from 'express';
import { getHealthHistory, ingestHealthMetric } from '../engines/healthEngine';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

/**
 * POST /health/ingest
 * Accept smartwatch metrics; user-scoped.
 */
router.post('/health/ingest', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const { heartRate, steps } = req.body as { heartRate?: unknown; steps?: unknown };

  if (typeof heartRate !== 'number' || !Number.isFinite(heartRate) || !Number.isInteger(heartRate) || heartRate <= 0) {
    res.status(400).json({ ok: false, error: 'heartRate must be a positive integer' });
    return;
  }

  if (
    typeof steps !== 'undefined' &&
    steps !== null &&
    (typeof steps !== 'number' || !Number.isFinite(steps) || !Number.isInteger(steps) || steps < 0)
  ) {
    res.status(400).json({ ok: false, error: 'steps must be a non-negative integer' });
    return;
  }

  try {
    const stored = await ingestHealthMetric(userId, {
      heartRate,
      steps: steps === undefined ? null : (steps as number | null),
    });
    res.status(200).json({ ok: true, stored });
  } catch {
    res.status(200).json({ ok: true, warning: 'persistence_failed' });
  }
});

/**
 * GET /health/history
 * User-scoped health timeline, newest first.
 */
router.get('/health/history', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const rows = await getHealthHistory(userId, limit);
    res.status(200).json(rows);
  } catch (error) {
    logger.error('Health history error', { error, userId });
    res.status(500).json({ error: 'Failed to get health history' });
  }
});

/**
 * POST /health/checkpoint
 * Accept comprehensive health checkpoint with sleep and mood data.
 */
router.post('/health/checkpoint', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const { heartRate, steps, sleepHours, moodScore } = req.body as {
    heartRate?: unknown;
    steps?: unknown;
    sleepHours?: unknown;
    moodScore?: unknown;
  };

  // Validate heartRate (required)
  if (
    typeof heartRate !== 'number' ||
    !Number.isFinite(heartRate) ||
    !Number.isInteger(heartRate) ||
    heartRate <= 0
  ) {
    res.status(400).json({ ok: false, error: 'heartRate must be a positive integer' });
    return;
  }

  // Validate steps (optional)
  if (
    typeof steps !== 'undefined' &&
    steps !== null &&
    (typeof steps !== 'number' || !Number.isFinite(steps) || !Number.isInteger(steps) || steps < 0)
  ) {
    res.status(400).json({ ok: false, error: 'steps must be a non-negative integer' });
    return;
  }

  // Validate sleepHours (optional, can be decimal)
  if (
    typeof sleepHours !== 'undefined' &&
    sleepHours !== null &&
    (typeof sleepHours !== 'number' || !Number.isFinite(sleepHours) || sleepHours < 0)
  ) {
    res.status(400).json({ ok: false, error: 'sleepHours must be a non-negative number' });
    return;
  }

  // Validate moodScore (optional, 1-10 scale)
  if (
    typeof moodScore !== 'undefined' &&
    moodScore !== null &&
    (typeof moodScore !== 'number' ||
      !Number.isFinite(moodScore) ||
      !Number.isInteger(moodScore) ||
      moodScore < 1 ||
      moodScore > 10)
  ) {
    res.status(400).json({ ok: false, error: 'moodScore must be an integer between 1 and 10' });
    return;
  }

  try {
    const { ingestHealthCheckpoint } = await import('../health/health.service');
    const checkpoint = await ingestHealthCheckpoint(userId, {
      heartRate,
      steps: steps === undefined ? null : (steps as number | null),
      sleepHours: sleepHours === undefined ? null : (sleepHours as number | null),
      moodScore: moodScore === undefined ? null : (moodScore as number | null),
    });
    res.status(200).json({ ok: true, checkpoint });
  } catch (error) {
    logger.error('Health checkpoint error', { error, userId });
    res.status(500).json({ ok: false, error: 'Failed to store health checkpoint' });
  }
});

/**
 * GET /health/analysis
 * Get health trend analysis for the user.
 */
router.get('/health/analysis', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { analyzeHealthTrends } = await import('../health/health.service');
    const analysis = await analyzeHealthTrends(userId);
    res.status(200).json(analysis);
  } catch (error) {
    logger.error('Health analysis error', { error, userId });
    res.status(500).json({ error: 'Failed to analyze health trends' });
  }
});

export default router;
