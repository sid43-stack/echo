import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, and response status
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function (this: Response, chunk?: unknown, encoding?: BufferEncoding | (() => void), cb?: () => void): Response {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    }
    if (encoding !== undefined && cb !== undefined) {
      return originalEnd(chunk, encoding, cb);
    }
    if (encoding !== undefined) {
      return originalEnd(chunk, encoding);
    }
    return originalEnd(chunk);
  } as typeof res.end;

  next();
};

