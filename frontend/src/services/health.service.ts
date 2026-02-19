/**
 * Health Service
 * Frontend service for health checkpoint management and analysis.
 */

import { api } from '../api/client';
import type {
    ApiHealthCheckpoint,
    ApiHealthCheckpointResponse,
    ApiHealthAnalysis,
} from '../api/types';

export interface HealthCheckpointInput {
    heartRate: number;
    steps?: number;
    sleepHours?: number;
    moodScore?: number;
}

/**
 * Send a health checkpoint to the backend.
 */
export async function sendCheckpoint(
    data: HealthCheckpointInput
): Promise<ApiHealthCheckpoint> {
    const response = await api.post<ApiHealthCheckpointResponse>('/health/checkpoint', data);

    if (!response.ok || !response.checkpoint) {
        throw new Error(response.error || 'Failed to send health checkpoint');
    }

    return response.checkpoint;
}

/**
 * Get health checkpoint history for the current user.
 */
export async function getHealthHistory(limit: number = 50): Promise<ApiHealthCheckpoint[]> {
    return api.get<ApiHealthCheckpoint[]>(`/health/history?limit=${limit}`);
}

/**
 * Get health trend analysis for the current user.
 */
export async function getHealthAnalysis(): Promise<ApiHealthAnalysis> {
    return api.get<ApiHealthAnalysis>('/health/analysis');
}
