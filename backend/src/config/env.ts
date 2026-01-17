import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

/**
 * Environment configuration
 * Validates and exports environment variables
 */
export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

// Validate required environment variables
if (env.nodeEnv === 'production' && env.jwtSecret === 'default-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}

