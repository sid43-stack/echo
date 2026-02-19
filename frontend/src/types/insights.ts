import type { MoodType } from '../pages/onboarding/EmotionalBaseline';

/**
 * Insights Data Models
 * 
 * Structures for tracking mood patterns and generating insights.
 * Prepared for future insights dashboard feature.
 */

export interface MoodEntry {
    timestamp: number; // Unix timestamp
    mood: MoodType;
    context?: string; // Optional context (e.g., "after chat", "morning check-in")
}

export interface MoodPattern {
    timeOfDay?: Record<string, MoodType>; // e.g., { "morning": "calm", "evening": "anxious" }
    dayOfWeek?: Record<string, MoodType>; // e.g., { "Monday": "overwhelmed", "Friday": "calm" }
    triggers?: string[]; // Future: detected triggers
}

export interface InsightData {
    moodHistory: MoodEntry[];
    patterns?: MoodPattern;
    lastUpdated?: number;
}

// Helper to create a new mood entry
export const createMoodEntry = (mood: MoodType, context?: string): MoodEntry => ({
    timestamp: Date.now(),
    mood,
    context,
});

// Helper to initialize empty insights data
export const createEmptyInsights = (): InsightData => ({
    moodHistory: [],
    patterns: undefined,
    lastUpdated: Date.now(),
});
