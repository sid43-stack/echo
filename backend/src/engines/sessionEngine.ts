import { randomUUID } from 'crypto';
import { startCall, endCall } from './callEngine';

const RATE_LIMIT_REQUESTS = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

type SessionType = 'chat' | 'call';

type SessionMeta = {
  type: SessionType;
  createdAt: Date;
  endedAt: Date | null;
  paused: boolean;
  requestTimestamps: number[];
};

const sessions = new Map<string, SessionMeta>();

/**
 * Create a new session. For 'call', delegates to callEngine.startCall(userId) and
 * registers the returned id. For 'chat', generates a new id and registers.
 */
export const createSession = async (
  type: SessionType,
  userId: string
): Promise<{ sessionId: string; startedAt: Date }> => {
  if (type === 'call') {
    const { id, startedAt } = await startCall(userId);
    sessions.set(id, {
      type: 'call',
      createdAt: startedAt,
      endedAt: null,
      paused: false,
      requestTimestamps: [],
    });
    return { sessionId: id, startedAt };
  }

  const sessionId = randomUUID();
  const startedAt = new Date();
  sessions.set(sessionId, {
    type: 'chat',
    createdAt: startedAt,
    endedAt: null,
    paused: false,
    requestTimestamps: [],
  });
  return { sessionId, startedAt };
};

/**
 * End a session. For 'call', delegates to callEngine.endCall(userId, sessionId); then marks
 * the session ended in the local store.
 */
export const endSession = async (userId: string, sessionId: string): Promise<boolean> => {
  const meta = sessions.get(sessionId);
  if (!meta) return false;

  if (meta.type === 'call') {
    await endCall(userId, sessionId);
  }

  meta.endedAt = new Date();
  return true;
};

/**
 * Returns true if the session exists, is not ended, and is not paused.
 * Does not enforce rate; use tryRecordRequest for that.
 */
export const checkSessionActive = (sessionId: string): boolean => {
  const meta = sessions.get(sessionId);
  if (!meta || meta.endedAt !== null || meta.paused) return false;
  return true;
};

/**
 * Record a request and enforce rate limit (e.g. 60 requests per minute).
 * Returns true if the request is allowed, false if rate limited or session inactive.
 */
export const tryRecordRequest = (sessionId: string): boolean => {
  const meta = sessions.get(sessionId);
  if (!meta || meta.endedAt !== null || meta.paused) return false;

  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  meta.requestTimestamps = meta.requestTimestamps.filter((t) => t > cutoff);
  if (meta.requestTimestamps.length >= RATE_LIMIT_REQUESTS) return false;

  meta.requestTimestamps.push(now);
  return true;
};

/**
 * Set or clear the pause flag for a session.
 * When paused, checkSessionActive and tryRecordRequest will return false.
 */
export const setPaused = (sessionId: string, paused: boolean): void => {
  const meta = sessions.get(sessionId);
  if (meta) meta.paused = paused;
};
