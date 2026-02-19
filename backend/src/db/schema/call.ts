import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';

export const callSessions = pgTable('call_sessions', {
  id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});
