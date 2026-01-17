import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Centralized error handler middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak stack traces in production
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

