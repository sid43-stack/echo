import { pgTable, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';

export const healthMetrics = pgTable('health_metrics', {
  id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  heartRate: integer('heart_rate').notNull(),
  steps: integer('steps'),
  sleepHours: integer('sleep_hours'), // Hours of sleep (can be decimal represented as minutes)
  moodScore: integer('mood_score'), // 1-10 mood rating
  source: text('source').notNull(), // "watch", "health_connect", etc.
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
