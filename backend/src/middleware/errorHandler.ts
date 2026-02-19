import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Centralized error handler. Logs auth, AI provider, and DB errors clearly.
 * Never crashes the server; AI provider failures are handled in services with fallback responses.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const category =
    err.message?.includes('JWT') || err.message?.includes('Unauthorized')
      ? 'auth'
      : err.message?.includes('OpenAI') ||
        err.message?.includes('Google') ||
        err.message?.includes('agent') ||
        err.message?.includes('AI')
        ? 'ai'
        : err.message?.includes('database') || err.message?.includes('connection')
          ? 'db'
          : 'server';

  logger.error('Error occurred', {
    category,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { message: err.message, stack: err.stack }),
  });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
};

