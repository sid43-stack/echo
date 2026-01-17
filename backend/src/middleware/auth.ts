import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * JWT authentication middleware
 * Validates JWT token from Authorization header
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as {
        id: string;
        email: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token', { error: jwtError });
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({ error: 'Authentication failed' });
  }
};

