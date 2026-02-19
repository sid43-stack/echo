import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import * as authService from './service';
import { logger } from '../utils/logger';

const router: Router = Router();

/**
 * POST /auth/register
 * Body: { email, password, name? }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as { email?: unknown; password?: unknown; name?: unknown };
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const result = await authService.register(email, password, typeof name === 'string' ? name : undefined);
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message === 'Email already registered') {
      res.status(409).json({ error: message });
      return;
    }
    if (message === 'Email is required' || message.includes('Password')) {
      res.status(400).json({ error: message });
      return;
    }
    logger.error('Auth: register error', { error: err });
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    if (message === 'Invalid email or password') {
      res.status(401).json({ error: message });
      return;
    }
    logger.error('Auth: login error', { error: err });
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /auth/me
 * Requires: Authorization Bearer <token>
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await authService.getMe(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    logger.error('Auth: getMe error', { error: err });
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
