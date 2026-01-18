import { Router, Request, Response } from 'express';

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

export default router;

