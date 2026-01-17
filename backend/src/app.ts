import express, { Express } from 'express';
import { requestLogger } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import voiceRoutes from './routes/voice';
import sessionRoutes from './routes/session';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Routes
  app.use('/', healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/ai', aiRoutes);
  app.use('/voice', voiceRoutes);
  app.use('/session', sessionRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

