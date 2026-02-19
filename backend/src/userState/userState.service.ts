/**
 * User State Service
 * Manages the user_state and conversation_reflections tables.
 * Independent from voice/session code.
 */

import { db } from '../db/drizzle';
import { userState } from '../db/schema/userState';
import { conversationReflections } from '../db/schema/conversationReflections';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Get or create user state record for a given userId.
 */
export async function getUserState(userId: string) {
    const existing = await db
        .select()
        .from(userState)
        .where(eq(userState.userId, userId))
        .limit(1);

    if (existing.length > 0) {
        return existing[0];
    }

    // Create new record
    const inserted = await db
        .insert(userState)
        .values({ userId })
        .returning();

    return inserted[0];
}

/**
 * Update user state with mood, energy, summary, and preferredMode.
 * Handles streak logic:
 *   - If lastInteractionAt was yesterday → increment streak
 *   - If >48h gap → reset to 1
 *   - Otherwise (same day) → keep streak, just update
 */
export async function updateUserState(
    userId: string,
    data: {
        mood: string;
        energy: string;
        summary: string;
        preferredMode: 'chat' | 'voice';
    }
) {
    const current = await getUserState(userId);
    const now = new Date();
    const lastInteraction = current.lastInteractionAt
        ? new Date(current.lastInteractionAt)
        : null;

    let newStreak = current.conversationStreak ?? 0;

    if (lastInteraction) {
        const diffMs = now.getTime() - lastInteraction.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Check if lastInteraction was "yesterday" (between 24h and 48h ago)
        if (diffHours >= 24 && diffHours < 48) {
            newStreak += 1;
        } else if (diffHours >= 48) {
            // Gap too large — reset
            newStreak = 1;
        }
        // If < 24h (same day), keep existing streak
    } else {
        // First interaction ever
        newStreak = 1;
    }

    const updated = await db
        .update(userState)
        .set({
            lastInteractionAt: now,
            lastMood: data.mood,
            energyLevel: data.energy,
            lastSummary: data.summary,
            preferredMode: data.preferredMode,
            conversationStreak: newStreak,
            updatedAt: now,
        })
        .where(eq(userState.userId, userId))
        .returning();

    logger.info('User state updated', { userId, streak: newStreak });
    return updated[0];
}

/**
 * Get the last N conversation reflections for a user.
 */
export async function getReflections(userId: string, limit: number = 5) {
    return db
        .select()
        .from(conversationReflections)
        .where(eq(conversationReflections.userId, userId))
        .orderBy(desc(conversationReflections.createdAt))
        .limit(limit);
}

/**
 * Store a conversation reflection for a user.
 */
export async function storeReflection(userId: string, reflection: string) {
    const inserted = await db
        .insert(conversationReflections)
        .values({ userId, reflection })
        .returning();

    logger.info('Reflection stored', { userId, id: inserted[0].id });

    // Fire-and-forget blockchain proof (non-blocking)
    try {
        const { createBlockchainProofAsync } = await import('../blockchain/proof.service');
        createBlockchainProofAsync(userId, inserted[0].id, reflection).catch(() => {
            // Silently swallow — proof creation must never affect conversation flow
        });
    } catch {
        // Dynamic import failed — blockchain module not available, ignore
    }

    return inserted[0];
}
