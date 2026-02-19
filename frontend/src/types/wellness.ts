/**
 * Wellness Data Models
 * 
 * Structures for wellness signals from smartwatch or manual input.
 * Prepared for future wellness tracking and Layer 4 dashboard display.
 */

export type WellnessSignalType = 'sleep' | 'activity' | 'heartRate' | 'custom';

export type SleepQuality = 'good' | 'fair' | 'poor';
export type ActivityLevel = 'high' | 'moderate' | 'low';

export interface WellnessSignal {
    timestamp: number; // Unix timestamp
    type: WellnessSignalType;
    value: number | string;
    unit?: string; // e.g., "hours", "steps", "bpm"
    source?: 'watch' | 'manual' | 'estimated';
}

export interface WellnessSummary {
    sleepQuality?: SleepQuality;
    sleepHours?: number;
    activityLevel?: ActivityLevel;
    steps?: number;
    lastUpdated?: number;
}

export interface WellnessData {
    signals: WellnessSignal[];
    summary?: WellnessSummary;
    lastSyncTime?: number;
}

// Helper to create a wellness signal
export const createWellnessSignal = (
    type: WellnessSignalType,
    value: number | string,
    unit?: string,
    source: 'watch' | 'manual' | 'estimated' = 'manual'
): WellnessSignal => ({
    timestamp: Date.now(),
    type,
    value,
    unit,
    source,
});

// Helper to initialize empty wellness data
export const createEmptyWellness = (): WellnessData => ({
    signals: [],
    summary: undefined,
    lastSyncTime: undefined,
});

// Helper to generate friendly wellness text for Layer 4 display
export const getWellnessDisplayText = (summary?: WellnessSummary): string => {
    if (!summary) return 'Wellness signals: No data yet';

    const parts: string[] = [];

    if (summary.sleepQuality) {
        const sleepText = summary.sleepQuality === 'good' ? 'Resting well' :
            summary.sleepQuality === 'fair' ? 'Sleep okay' :
                'Rest needed';
        parts.push(sleepText);
    }

    if (summary.activityLevel) {
        const activityText = summary.activityLevel === 'high' ? 'Very active' :
            summary.activityLevel === 'moderate' ? 'Activity balanced' :
                'Light activity';
        parts.push(activityText);
    }

    return parts.length > 0 ? `Wellness signals: ${parts.join(' · ')}` : 'Wellness signals: No data yet';
};
