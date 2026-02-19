/**
 * Health Service
 * Comprehensive health data management with trend analysis.
 */

import { db } from '../db/drizzle';
import { healthMetrics } from '../db/schema/health';
import { desc, eq, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface HealthCheckpointInput {
    heartRate: number;
    steps?: number | null;
    sleepHours?: number | null;
    moodScore?: number | null;
    source?: string;
}

export interface HealthCheckpoint {
    id: string;
    heartRate: number;
    steps: number | null;
    sleepHours: number | null;
    moodScore: number | null;
    source: string;
    recordedAt: Date;
}

export interface HealthTrendAnalysis {
    avgHeartRate: number;
    abnormalSpikes: boolean;
    stepDecline: boolean;
    lowSleep: boolean;
    moodTrend: 'improving' | 'declining' | 'stable' | 'unknown';
    summary: string;
}

/**
 * Ingest a new health checkpoint (user-scoped).
 */
export async function ingestHealthCheckpoint(
    userId: string,
    data: HealthCheckpointInput
): Promise<HealthCheckpoint> {
    const [row] = await db
        .insert(healthMetrics)
        .values({
            userId,
            heartRate: data.heartRate,
            steps: data.steps ?? null,
            sleepHours: data.sleepHours ?? null,
            moodScore: data.moodScore ?? null,
            source: data.source || 'health_connect',
            recordedAt: new Date(),
        })
        .returning();

    if (!row) {
        logger.error('Health checkpoint insert failed', { userId });
        throw new Error('Failed to store health checkpoint');
    }

    return row as HealthCheckpoint;
}

/**
 * Get recent health checkpoints for a user.
 */
export async function getRecentHealthCheckpoints(
    userId: string,
    limit: number = 50
): Promise<HealthCheckpoint[]> {
    const rows = await db
        .select()
        .from(healthMetrics)
        .where(eq(healthMetrics.userId, userId))
        .orderBy(desc(healthMetrics.recordedAt))
        .limit(limit);

    return rows as HealthCheckpoint[];
}

/**
 * Analyze health trends for a user.
 * Returns statistics and trend summary.
 */
export async function analyzeHealthTrends(
    userId: string
): Promise<HealthTrendAnalysis> {
    // Get last 30 checkpoints for trend analysis
    const checkpoints = await getRecentHealthCheckpoints(userId, 30);

    if (checkpoints.length === 0) {
        return {
            avgHeartRate: 0,
            abnormalSpikes: false,
            stepDecline: false,
            lowSleep: false,
            moodTrend: 'unknown',
            summary: 'No health data available yet.',
        };
    }

    // Calculate average heart rate
    const heartRates = checkpoints.map((c) => c.heartRate);
    const avgHeartRate = Math.round(
        heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
    );

    // Detect abnormal spikes (HR > 100 or any spike > 30% above average)
    const abnormalSpikes = heartRates.some(
        (hr) => hr > 100 || hr > avgHeartRate * 1.3
    );

    // Detect step decline (last 7 days vs previous 7 days)
    const stepsData = checkpoints.filter((c) => c.steps !== null).map((c) => c.steps!);
    let stepDecline = false;
    if (stepsData.length >= 14) {
        const recentSteps = stepsData.slice(0, 7).reduce((sum, s) => sum + s, 0) / 7;
        const previousSteps = stepsData.slice(7, 14).reduce((sum, s) => sum + s, 0) / 7;
        stepDecline = recentSteps < previousSteps * 0.7; // 30% decline
    }

    // Detect low sleep (average < 6 hours)
    const sleepData = checkpoints.filter((c) => c.sleepHours !== null).map((c) => c.sleepHours!);
    const lowSleep = sleepData.length > 0 &&
        sleepData.reduce((sum, s) => sum + s, 0) / sleepData.length < 6;

    // Analyze mood trend
    const moodData = checkpoints.filter((c) => c.moodScore !== null).map((c) => c.moodScore!);
    let moodTrend: 'improving' | 'declining' | 'stable' | 'unknown' = 'unknown';
    if (moodData.length >= 5) {
        const recentMood = moodData.slice(0, 3).reduce((sum, m) => sum + m, 0) / 3;
        const previousMood = moodData.slice(3, 6).reduce((sum, m) => sum + m, 0) / 3;
        if (recentMood > previousMood + 1) moodTrend = 'improving';
        else if (recentMood < previousMood - 1) moodTrend = 'declining';
        else moodTrend = 'stable';
    }

    // Generate summary
    const issues: string[] = [];
    if (abnormalSpikes) issues.push('elevated heart rate');
    if (stepDecline) issues.push('reduced activity');
    if (lowSleep) issues.push('insufficient sleep');
    if (moodTrend === 'declining') issues.push('declining mood');

    let summary = '';
    if (issues.length > 0) {
        summary = `Recent health trend: ${issues.join(', ')}.`;
    } else {
        summary = `Health metrics appear stable. Average heart rate: ${avgHeartRate} bpm.`;
        if (moodTrend === 'improving') summary += ' Mood is improving.';
    }

    logger.info('Health trends analyzed', { userId, avgHeartRate, abnormalSpikes, stepDecline, lowSleep, moodTrend });

    return {
        avgHeartRate,
        abnormalSpikes,
        stepDecline,
        lowSleep,
        moodTrend,
        summary,
    };
}
