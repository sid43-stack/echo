import { db } from '../db/drizzle';
import { sql } from 'drizzle-orm';
import { desc, eq } from 'drizzle-orm';
import { healthMetrics } from '../db/schema/health';

export type HealthMetricInput = {
  heartRate: number;
  steps?: number | null;
  sleepHours?: number | null;
  moodScore?: number | null;
};

export type HealthMetricRecord = {
  id: string;
  heartRate: number;
  steps: number | null;
  sleepHours: number | null;
  moodScore: number | null;
  source: string;
  recordedAt: Date;
};

export const ingestHealthMetric = async (
  userId: string,
  input: HealthMetricInput
): Promise<HealthMetricRecord> => {
  const [row] = await db
    .insert(healthMetrics)
    .values({
      userId,
      heartRate: input.heartRate,
      steps: input.steps ?? null,
      sleepHours: input.sleepHours ?? null,
      moodScore: input.moodScore ?? null,
      source: 'watch',
      recordedAt: new Date(),
    })
    .returning();

  if (!row) throw new Error('Failed to store health metric');
  return row as HealthMetricRecord;
};

/**
 * Get health history for user, newest first.
 */
export const getHealthHistory = async (
  userId: string,
  limit: number = 50
): Promise<HealthMetricRecord[]> => {
  const rows = await db
    .select()
    .from(healthMetrics)
    .where(eq(healthMetrics.userId, userId))
    .orderBy(desc(healthMetrics.recordedAt))
    .limit(limit);
  return rows as HealthMetricRecord[];
};

/**
 * Check database connectivity.
 */
export const checkDatabaseHealth = async (): Promise<'connected' | 'unreachable'> => {
  try {
    await db.execute(sql`SELECT 1`);
    return 'connected';
  } catch {
    return 'unreachable';
  }
};
