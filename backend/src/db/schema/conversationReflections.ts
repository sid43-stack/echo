import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';

export const conversationReflections = pgTable('conversation_reflections', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    reflection: text('reflection').notNull(),
});
