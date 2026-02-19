import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';

export const userState = pgTable('user_state', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: uuid('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),
    lastInteractionAt: timestamp('last_interaction_at').defaultNow().notNull(),
    conversationStreak: integer('conversation_streak').default(0).notNull(),
    lastMood: text('last_mood'),
    energyLevel: text('energy_level'),
    lastSummary: text('last_summary'),
    preferredMode: text('preferred_mode'), // "chat" | "voice"
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
