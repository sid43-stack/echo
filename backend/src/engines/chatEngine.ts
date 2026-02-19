import { db } from '../db/drizzle';
import { chatMessages } from '../db/schema/chat';
import { desc, eq } from 'drizzle-orm';
import { generateChatReply } from '../ai';
import { checkInput, type SafetyState } from '../engines/safetyEngine';
import { checkSessionActive, tryRecordRequest } from '../engines/sessionEngine';
import { getRecentHealthCheckpoints, analyzeHealthTrends } from '../health/health.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: Date;
}

/** Thrown when input is blocked by safety or session (paused / rate). */
export class SafetyBlockedError extends Error {
  constructor(
    message: string,
    public readonly state: SafetyState
  ) {
    super(message);
    this.name = 'SafetyBlockedError';
  }
}

/**
 * Persist user + assistant messages to database (user-scoped).
 */
export const persistChatMessages = async (
  userId: string,
  userText: string,
  assistantText: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> => {
  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      userId,
      role: 'user',
      message: userText,
    })
    .returning();

  const [assistantMessage] = await db
    .insert(chatMessages)
    .values({
      userId,
      role: 'assistant',
      message: assistantText,
    })
    .returning();

  if (!userMessage || !assistantMessage) {
    throw new Error('Failed to persist chat messages');
  }

  return {
    userMessage: userMessage as ChatMessage,
    assistantMessage: assistantMessage as ChatMessage,
  };
};

/**
 * Send a chat message: safety check → AI provider → persist (user-scoped).
 * Enhanced with health context when analytics is enabled.
 * On AI provider failure, returns a safe fallback message without crashing.
 */
export const sendChatMessage = async (
  userId: string,
  message: string,
  sessionId?: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage; healthAlert?: boolean }> => {
  if (sessionId !== undefined) {
    if (!checkSessionActive(sessionId)) {
      throw new SafetyBlockedError('Session paused or inactive', {
        safe: false,
        reason: 'session paused or inactive',
        paused: true,
      });
    }
    if (!tryRecordRequest(sessionId)) {
      throw new SafetyBlockedError('Rate limit exceeded', {
        safe: false,
        reason: 'rate limit exceeded',
      });
    }
  }

  const safetyState = checkInput(message, sessionId);
  if (!safetyState.safe) {
    throw new SafetyBlockedError(safetyState.reason ?? 'Input blocked', safetyState);
  }

  // Enhance with health context if analytics enabled
  let healthAlert = false;
  let enhancedMessage = message;

  if (env.healthAnalyticsEnabled) {
    try {
      const checkpoints = await getRecentHealthCheckpoints(userId, 5);
      if (checkpoints.length > 0) {
        const analysis = await analyzeHealthTrends(userId);

        // Append health summary to message context
        const healthContext = `\n\n[Health Context: ${analysis.summary}]`;
        enhancedMessage = message + healthContext;

        // Set health alert flag if abnormal patterns detected
        healthAlert = analysis.abnormalSpikes || analysis.stepDecline || analysis.lowSleep;
      }
    } catch (error) {
      // Health context is optional; don't fail the chat if it errors
      logger.warn('Failed to enhance chat with health context', { error, userId });
    }
  }

  const reply = await generateChatReply(enhancedMessage);
  const messages = await persistChatMessages(userId, message, reply);

  return {
    ...messages,
    ...(healthAlert && { healthAlert }),
  };
};

/**
 * Get chat history for a user (newest-first order, then reversed for chronological response).
 */
export const getChatHistory = async (
  userId: string,
  limit: number = 20
): Promise<ChatMessage[]> => {
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  return (messages.reverse() as ChatMessage[]) ?? [];
};
