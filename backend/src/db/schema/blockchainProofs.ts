import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';
import { users } from './users';
import { conversationReflections } from './conversationReflections';

/**
 * Blockchain Proofs Table
 * Stores on-chain proof metadata for conversation reflections.
 * Each row links a reflection to its Algorand transaction.
 */
export const blockchainProofs = pgTable('blockchain_proofs', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
    reflectionId: uuid('reflection_id')
        .notNull()
        .references(() => conversationReflections.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    recordHash: text('record_hash').notNull(),
    transactionId: text('transaction_id'),
    appId: text('app_id'),
    status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'failed'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
