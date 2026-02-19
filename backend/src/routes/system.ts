import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../engines/healthEngine';

const router: Router = Router();

/**
 * GET /system/health
 * Health check endpoint - returns server status and basic info
 */
router.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseHealth();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: dbStatus,
  });
});

/**
 * GET /system/version
 * Returns application version information
 */
router.get('/version', (req: Request, res: Response) => {
  res.status(200).json({
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
