import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  openaiApiKey: string;
  openaiModel: string;
  aiTimeoutMs: number;
  healthAnalyticsEnabled: boolean;
  aiProvider: string;
  cerebrasApiKey: string;
  // Google Cloud
  googleProjectId: string;
  googleApplicationCredentials: string;
  // Algorand blockchain (optional)
  algorandAppId: number;
  algorandMnemonic: string;
  algorandNetwork: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const portRaw = requireEnv('PORT');
const port = parseInt(portRaw, 10);
if (Number.isNaN(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a number between 1 and 65535');
}

/**
 * Environment configuration. Fails fast if required vars are missing.
 */
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
  throw new Error('NODE_ENV must be development, production, or test');
}

export const env: EnvConfig = {
  port,
  nodeEnv,
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // OpenAI configuration for chat (GPT-4.1)
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // AI provider hardening
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '8000', 10),

  // Health analytics feature flag
  healthAnalyticsEnabled: process.env.HEALTH_ANALYTICS_ENABLED !== 'false',

  // AI provider selection and Cerebras configuration
  aiProvider: process.env.AI_PROVIDER || 'openai',
  cerebrasApiKey: requireEnv('CEREBRAS_API_KEY'),

  // Google Cloud
  googleProjectId: process.env.GOOGLE_PROJECT_ID || '',
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',

  // Algorand blockchain (optional — features disabled if not set)
  algorandAppId: parseInt(process.env.ALGORAND_APP_ID || '0', 10),
  algorandMnemonic: process.env.ALGORAND_MNEMONIC || '',
  algorandNetwork: process.env.ALGORAND_NETWORK || 'testnet',
};

