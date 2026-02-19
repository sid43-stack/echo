/**
 * Android Health Connect Integration Layer
 * Platform integration for reading health data from Android Health Connect.
 * 
 * Note: This requires Android native bridge (React Native or Capacitor).
 * This module provides graceful fallback for non-Android platforms.
 */

import { sendCheckpoint } from '../services/health.service';
import type { HealthCheckpointInput } from '../services/health.service';

// Platform detection
function isAndroid(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /android/i.test(navigator.userAgent);
}

// Check if Health Connect is available (would be provided by native bridge)
function isHealthConnectAvailable(): boolean {
    // @ts-expect-error - Native bridge would inject this
    return typeof window.HealthConnect !== 'undefined';
}

/**
 * Request Health Connect permissions.
 * Returns true if permissions granted, false otherwise.
 */
export async function requestPermissions(): Promise<boolean> {
    if (!isAndroid() || !isHealthConnectAvailable()) {
        console.warn('Health Connect not available on this platform');
        return false;
    }

    try {
        // @ts-expect-error - Native bridge method
        const result = await window.HealthConnect.requestPermissions([
            'HEART_RATE',
            'STEPS',
            'SLEEP',
        ]);
        return result.granted === true;
    } catch (error) {
        console.error('Health Connect permission request failed:', error);
        return false;
    }
}

/**
 * Read recent heart rate data from Health Connect.
 */
export async function readHeartRate(): Promise<number | null> {
    if (!isAndroid() || !isHealthConnectAvailable()) {
        return null;
    }

    try {
        // @ts-expect-error - Native bridge method
        const data = await window.HealthConnect.readHeartRate({
            startTime: Date.now() - 3600000, // Last hour
            endTime: Date.now(),
        });

        if (data && data.samples && data.samples.length > 0) {
            // Return most recent measurement
            return data.samples[data.samples.length - 1].beatsPerMinute;
        }
        return null;
    } catch (error) {
        console.error('Failed to read heart rate:', error);
        return null;
    }
}

/**
 * Read step count from Health Connect.
 */
export async function readSteps(): Promise<number | null> {
    if (!isAndroid() || !isHealthConnectAvailable()) {
        return null;
    }

    try {
        // @ts-expect-error - Native bridge method
        const data = await window.HealthConnect.readSteps({
            startTime: Date.now() - 86400000, // Last 24 hours
            endTime: Date.now(),
        });

        if (data && data.count !== undefined) {
            return data.count;
        }
        return null;
    } catch (error) {
        console.error('Failed to read steps:', error);
        return null;
    }
}

/**
 * Read sleep duration from Health Connect.
 */
export async function readSleep(): Promise<number | null> {
    if (!isAndroid() || !isHealthConnectAvailable()) {
        return null;
    }

    try {
        // @ts-expect-error - Native bridge method
        const data = await window.HealthConnect.readSleep({
            startTime: Date.now() - 86400000, // Last 24 hours
            endTime: Date.now(),
        });

        if (data && data.sessions && data.sessions.length > 0) {
            // Return most recent sleep session in hours
            const session = data.sessions[data.sessions.length - 1];
            const durationMs = session.endTime - session.startTime;
            return durationMs / 3600000; // Convert to hours
        }
        return null;
    } catch (error) {
        console.error('Failed to read sleep:', error);
        return null;
    }
}

/**
 * Sync health data from Health Connect and send to backend.
 * This is the main integration point that reads all available data
 * and sends it as a checkpoint.
 */
export async function syncHealthData(): Promise<void> {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
        console.warn('Health Connect permissions not granted');
        return;
    }

    try {
        const [heartRate, steps, sleepHours] = await Promise.all([
            readHeartRate(),
            readSteps(),
            readSleep(),
        ]);

        // Only send if we have at least heart rate data
        if (heartRate === null) {
            console.warn('No heart rate data available');
            return;
        }

        const checkpointData: HealthCheckpointInput = {
            heartRate,
            steps: steps ?? undefined,
            sleepHours: sleepHours ?? undefined,
        };

        await sendCheckpoint(checkpointData);
        console.log('Health data synced successfully');
    } catch (error) {
        console.error('Failed to sync health data:', error);
        throw error;
    }
}
