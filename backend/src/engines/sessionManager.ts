/**
 * Session Manager
 * In-memory session storage
 * One active session per user
 * Auto-expires inactive sessions
 */

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
}

// In-memory session storage
const sessions = new Map<string, Session>();

// Map userId to sessionId (one active session per user)
const userSessions = new Map<string, string>();

// Session expiry time: 10 minutes
const SESSION_EXPIRY_MS = 10 * 60 * 1000;

// Cleanup interval: check every minute
const CLEANUP_INTERVAL_MS = 60 * 1000;

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Start a new session for user
 * Ends existing session if any
 * @param userId - User ID
 * @returns Session ID
 */
export const startSession = (userId: string): string => {
  // End existing session if any
  const existingSessionId = userSessions.get(userId);
  if (existingSessionId) {
    endSession(existingSessionId);
  }

  // Create new session
  const sessionId = generateSessionId();
  const now = Date.now();

  const session: Session = {
    sessionId,
    userId,
    createdAt: now,
    lastActivity: now,
  };

  sessions.set(sessionId, session);
  userSessions.set(userId, sessionId);

  return sessionId;
};

/**
 * Get session by session ID
 * @param sessionId - Session ID
 * @returns Session or null if not found/expired
 */
export const getSession = (sessionId: string): Session | null => {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Check if session expired
  const now = Date.now();
  if (now - session.lastActivity > SESSION_EXPIRY_MS) {
    endSession(sessionId);
    return null;
  }

  return session;
};

/**
 * End a session
 * @param sessionId - Session ID
 */
export const endSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  if (session) {
    sessions.delete(sessionId);
    userSessions.delete(session.userId);
  }
};

/**
 * Update session activity timestamp
 * @param sessionId - Session ID
 * @returns true if session exists and was updated, false otherwise
 */
export const touchSession = (sessionId: string): boolean => {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  // Check if session expired
  const now = Date.now();
  if (now - session.lastActivity > SESSION_EXPIRY_MS) {
    endSession(sessionId);
    return false;
  }

  // Update last activity
  session.lastActivity = now;
  return true;
};

/**
 * Cleanup expired sessions
 * Runs periodically to remove inactive sessions
 */
const cleanupExpiredSessions = (): void => {
  const now = Date.now();
  const expiredSessions: string[] = [];

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_EXPIRY_MS) {
      expiredSessions.push(sessionId);
    }
  }

  for (const sessionId of expiredSessions) {
    endSession(sessionId);
  }
};

// Start cleanup interval
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS);

