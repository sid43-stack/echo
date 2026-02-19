import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;

  // Core app
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;

  // Cerebras AI
  cerebrasApiKey: string;
  aiTimeoutMs: number;

  // Feature flags
  healthAnalyticsEnabled: boolean;

  // Algorand blockchain
  algorandAppId: number;
  algorandMnemonic: string;
  algorandNetwork: string;
}

/**
 * Required env validator
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * PORT (Render provides automatically)
 */
const port = Number(process.env.PORT) || 3000;

/**
 * NODE_ENV validation
 */
const nodeEnv = process.env.NODE_ENV || 'development';
if (!['development', 'production', 'test'].includes(nodeEnv)) {
  throw new Error('NODE_ENV must be development, production, or test');
}

/**
 * Algorand values
 */
const algorandAppIdRaw = requireEnv('ALGORAND_APP_ID');
const algorandAppId = Number(algorandAppIdRaw);
if (Number.isNaN(algorandAppId)) {
  throw new Error('ALGORAND_APP_ID must be a valid number');
}

export const env: EnvConfig = {
  port,
  nodeEnv,

  // Core
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Cerebras (AI brain)
  cerebrasApiKey: requireEnv('CEREBRAS_API_KEY'),
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '8000', 10),

  // Feature flags
  healthAnalyticsEnabled: process.env.HEALTH_ANALYTICS_ENABLED !== 'false',

  // Algorand (REQUIRED)
  algorandAppId,
  algorandMnemonic: requireEnv('ALGORAND_MNEMONIC'),
  algorandNetwork: process.env.ALGORAND_NETWORK || 'testnet',
};
