import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema',
  out: './drizzle',
  driver: 'pg',   // ← REQUIRED (not dialect)
  dbCredentials: {
    connectionString:process.env.DATABASE_URL!,
  },
} satisfies Config;
