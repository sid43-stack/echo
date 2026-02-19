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
 * Public: /auth/*, /system/*
 * Protected: /chat, /call, /health, /voice, /user-state, /assistant
 */
export const createApp = (): Express => {
  const app = express();

  /**
   * ================================
   * 1️⃣ CORS — MUST BE FIRST
   * ================================
   */
  const corsOptions: cors.CorsOptions = {
    origin: ['http://localhost:8080', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  /**
   * ================================
   * 2️⃣ Body Parsers (after CORS)
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
   * 5️⃣ Routes
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
   * 6️⃣ Error Handling (ALWAYS LAST)
   * ================================
   */
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
