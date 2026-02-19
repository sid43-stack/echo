import { db } from '../db/drizzle';
import { callSessions } from '../db/schema/call';
import { and, desc, eq, isNotNull } from 'drizzle-orm';

export type CallSession = {
  id: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
};

export type CallLog = {
  id: string;
  status: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
};

/**
 * Start a new call session (user-scoped).
 * Returns session information.
 */
export const startCall = async (userId: string): Promise<CallSession> => {
  const [row] = await db
    .insert(callSessions)
    .values({ userId, status: 'started' })
    .returning({
      id: callSessions.id,
      status: callSessions.status,
      startedAt: callSessions.createdAt,
      endedAt: callSessions.endedAt,
    });

  if (!row) throw new Error('Failed to create call session');

  return {
    id: row.id,
    status: row.status,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? null,
  };
};

/**
 * End an existing call session by id (must belong to user).
 */
export const endCall = async (userId: string, callId: string): Promise<CallSession | null> => {
  const [existing] = await db
    .select()
    .from(callSessions)
    .where(and(eq(callSessions.id, callId), eq(callSessions.userId, userId)))
    .limit(1);

  if (!existing) return null;

  const [updated] = await db
    .update(callSessions)
    .set({ status: 'ended', endedAt: new Date() })
    .where(eq(callSessions.id, callId))
    .returning({
      id: callSessions.id,
      status: callSessions.status,
      startedAt: callSessions.createdAt,
      endedAt: callSessions.endedAt,
    });

  if (!updated) return null;

  return {
    id: updated.id,
    status: updated.status,
    startedAt: updated.startedAt,
    endedAt: updated.endedAt ?? null,
  };
};

/**
 * Get a single call session by id (must belong to user).
 */
export const getCallStatus = async (userId: string, callId: string): Promise<CallSession | null> => {
  const [row] = await db
    .select({
      id: callSessions.id,
      status: callSessions.status,
      startedAt: callSessions.createdAt,
      endedAt: callSessions.endedAt,
    })
    .from(callSessions)
    .where(and(eq(callSessions.id, callId), eq(callSessions.userId, userId)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? null,
  };
};

/**
 * Get call logs for user (ended calls only), newest first.
 */
export const getCallLogs = async (userId: string, limit: number = 50): Promise<CallLog[]> => {
  const rows = await db
    .select({
      id: callSessions.id,
      status: callSessions.status,
      startedAt: callSessions.createdAt,
      endedAt: callSessions.endedAt,
    })
    .from(callSessions)
    .where(
      and(
        eq(callSessions.userId, userId),
        eq(callSessions.status, 'ended'),
        isNotNull(callSessions.endedAt)
      )
    )
    .orderBy(desc(callSessions.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const startedAt = row.startedAt;
    const endedAt = row.endedAt as Date;
    const durationSeconds = Math.max(
      0,
      Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
    );
    return {
      id: row.id,
      status: row.status,
      startedAt,
      endedAt,
      durationSeconds,
    };
  });
};
