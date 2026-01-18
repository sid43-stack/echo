import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

/**
 * POST /auth/login
 * Accepts email only, always succeeds
 * Returns JWT token and user info
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Generate fake user ID (in-memory placeholder)
    const userId = `user_${Date.now()}`;

    // Generate JWT token with 1 day expiry
    const token = jwt.sign(
      { id: userId, email },
      env.jwtSecret,
      { expiresIn: '1d' }
    );

    const user = {
      id: userId,
      email,
    };

    logger.info('User logged in', { email });

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /auth/me
 * Returns current authenticated user info
 * Protected route - requires authentication
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
});

export default router;

