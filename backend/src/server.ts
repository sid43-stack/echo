import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

/**
 * Start the Express server
 */
const startServer = (): void => {
  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info('Server started', {
      port: env.port,
      environment: env.nodeEnv,
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
};

// Start server
startServer();

