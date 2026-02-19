import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // "user" | "assistant"
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
