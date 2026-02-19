import type { MoodType } from '../pages/onboarding/EmotionalBaseline';

/**
 * Session Data Models
 * 
 * Structures for tracking conversation sessions and user activity.
 * Prepared for session history and continuity features.
 */

export type ActivityType = 'chat' | 'breathing' | 'journal' | 'health';

export interface ConversationSession {
    id: string; // Unique session ID
    timestamp: number; // Session start time (Unix timestamp)
    startMood: MoodType;
    endMood?: MoodType; // Mood after session (if captured)
    duration?: number; // Session duration in seconds
    activities: ActivityType[]; // Activities completed in this session
    notes?: string; // User's journal entry or session summary
    completedSuccessfully: boolean; // Whether session ended normally or was abandoned
}

export interface SessionHistory {
    sessions: ConversationSession[];
    totalSessions: number;
    lastSessionDate?: number;
    longestStreak?: number; // Future: consecutive days with sessions
}

// Helper to create a new session
export const createSession = (startMood: MoodType): ConversationSession => ({
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    startMood,
    activities: [],
    completedSuccessfully: false,
});

// Helper to add activity to session
export const addActivityToSession = (
    session: ConversationSession,
    activity: ActivityType
): ConversationSession => ({
    ...session,
    activities: [...session.activities, activity],
});

// Helper to complete session
export const completeSession = (
    session: ConversationSession,
    endMood?: MoodType,
    notes?: string
): ConversationSession => ({
    ...session,
    endMood,
    notes,
    duration: Math.floor((Date.now() - session.timestamp) / 1000),
    completedSuccessfully: true,
});

// Helper to initialize empty session history
export const createEmptySessionHistory = (): SessionHistory => ({
    sessions: [],
    totalSessions: 0,
    lastSessionDate: undefined,
    longestStreak: 0,
});

// Helper to get friendly "last active" text
export const getLastActiveText = (lastSessionDate?: number): string => {
    if (!lastSessionDate) return 'Welcome! This is your first session.';

    const now = Date.now();
    const diffMs = now - lastSessionDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'You were just here';
    if (diffHours < 24) return `Last active ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Last active yesterday';
    if (diffDays < 7) return `Last active ${diffDays} days ago`;

    return `Last active ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
};
