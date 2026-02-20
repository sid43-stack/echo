import cors from 'cors';
import express, { Express } from 'express';
import path from 'path';
import { requestLogger } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './auth/routes';
import healthRoutes from './routes/health';
import callRoutes from './routes/call';
import chatRoutes from './routes/chat';
import systemRoutes from './routes/system';
import voiceRoutes from './routes/voice';
import userStateRoutes from './userState/userState.routes';
import assistantRoutes from './routes/assistant';
import blockchainRoutes from './routes/blockchain';

/**
 * Create and configure Express application.
 */
export const createApp = (): Express => {
  const app = express();

  /**
   * ================================
   * 1️⃣ CORS — PRODUCTION SAFE
   * ================================
   */

  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://echo-2-rb0g.onrender.com', // FRONTEND (VERY IMPORTANT)
  ];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // allow server-to-server, curl, health checks
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('Blocked CORS origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));

  // VERY IMPORTANT — fixes preflight requests (wallet/login/chat)
  app.options('*', cors(corsOptions));

  /**
   * ================================
   * 2️⃣ Body Parsers
   * ================================
   */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /**
   * ================================
   * 3️⃣ Request Logging
   * ================================
   */
  app.use(requestLogger);

  /**
   * ================================
   * 4️⃣ Routes
   * ================================
   */
  app.use('/auth', authRoutes);
  app.use('/health', healthRoutes);
  app.use('/call', callRoutes);
  app.use('/chat', chatRoutes);
  app.use('/system', systemRoutes);
  app.use('/voice', voiceRoutes);
  app.use('/user-state', userStateRoutes);
  app.use('/assistant', assistantRoutes);
  app.use('/blockchain', blockchainRoutes);

  /**
   * ================================
   * 5️⃣ Error Handling (LAST)
   * ================================
   */
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
