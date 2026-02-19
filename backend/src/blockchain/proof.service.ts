/**
 * Blockchain Proof Service
 *
 * Generates SHA-256 hashes of conversation reflections and records them
 * on-chain via the Echo Proof smart contract on Algorand Testnet.
 *
 * ALL blockchain calls are non-blocking and failure-tolerant:
 *   - Errors are logged, never thrown to callers of the async wrapper.
 *   - The conversation flow is never blocked.
 */

import { createHash } from 'crypto';
import algosdk from 'algosdk';
import { db } from '../db/drizzle';
import { blockchainProofs } from '../db/schema/blockchainProofs';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import {
    algodClient,
    getAppId,
    getSignerAccount,
    isBlockchainEnabled,
    getExplorerUrl,
} from './algorand.client';
import { logger } from '../utils/logger';

// ── Hash generation ────────────────────────────────────────────────────

/**
 * Generate a SHA-256 hex hash of a session reflection.
 * Deterministic: same inputs always produce the same hash.
 */
export function generateSessionHash(
    summary: string,
    userId: string,
    timestamp: string
): string {
    const payload = `${summary}|${userId}|${timestamp}`;
    return createHash('sha256').update(payload).digest('hex');
}

// ── On-chain record creation ───────────────────────────────────────────

/**
 * Write a proof hash to Algorand via an application call.
 * Returns the confirmed transaction ID, or null on failure.
 */
async function submitOnChainRecord(
    hashHex: string,
    timestampUnix: number
): Promise<string | null> {
    const signer = getSignerAccount();
    if (!signer) return null;

    const appId = getAppId();
    if (!appId) return null;

    try {
        const suggestedParams = await algodClient.getTransactionParams().do();

        // Encode method selector for "create_record(byte[],uint64)void"
        const methodSelector = new Uint8Array(
            createHash('sha512_256')
                .update('create_record(byte[],uint64)void')
                .digest()
                .slice(0, 4)
        );

        // Encode arguments
        const hashBytes = new Uint8Array(Buffer.from(hashHex, 'hex'));
        const timestampBytes = algosdk.encodeUint64(timestampUnix);

        const senderAddr = signer.addr.toString();

        const txn = algosdk.makeApplicationCallTxnFromObject({
            sender: senderAddr,
            appIndex: appId,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [methodSelector, hashBytes, timestampBytes],
            suggestedParams,
            boxes: [
                {
                    appIndex: appId,
                    name: new Uint8Array([
                        ...algosdk.decodeAddress(senderAddr).publicKey,
                        ...timestampBytes,
                    ]),
                },
            ],
        });

        const signedTxn = txn.signTxn(signer.sk);
        const { txid } = await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation (up to 4 rounds)
        await algosdk.waitForConfirmation(algodClient, txid, 4);

        logger.info('On-chain record confirmed', { txId: txid, appId });
        return txid;
    } catch (err) {
        logger.error('Failed to submit on-chain record', {
            error: err instanceof Error ? err.message : String(err),
        });
        return null;
    }
}

// ── High-level proof workflow ──────────────────────────────────────────

/**
 * Create a blockchain proof record for a reflection.
 * 1. Generate SHA-256 hash
 * 2. Insert pending proof row into DB
 * 3. Submit to Algorand (if enabled)
 * 4. Update proof row with txId / status
 *
 * This is the ONLY function called from existing Echo code.
 * It is fire-and-forget: errors are caught internally.
 */
export async function createBlockchainProofAsync(
    userId: string,
    reflectionId: string,
    reflectionText: string
): Promise<void> {
    try {
        // Check if user has a wallet connected
        const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!userRows.length) return;

        const user = userRows[0];
        // Only proceed if wallet is connected — but still create the DB record
        // so it can be retried later when wallet is connected.

        const now = new Date();
        const timestamp = now.toISOString();
        const hash = generateSessionHash(reflectionText, userId, timestamp);

        // Insert pending proof into DB
        const [proof] = await db
            .insert(blockchainProofs)
            .values({
                reflectionId,
                userId,
                recordHash: hash,
                appId: String(getAppId()),
                status: 'pending',
            })
            .returning();

        logger.info('Blockchain proof record created (pending)', {
            proofId: proof.id,
            userId,
            reflectionId,
        });

        // If blockchain is not enabled or no wallet, mark as pending and return
        if (!isBlockchainEnabled()) {
            logger.info('Blockchain not enabled — proof stays pending', { proofId: proof.id });
            return;
        }

        // Submit on-chain
        const txId = await submitOnChainRecord(hash, Math.floor(now.getTime() / 1000));

        if (txId) {
            await db
                .update(blockchainProofs)
                .set({
                    transactionId: txId,
                    status: 'confirmed',
                })
                .where(eq(blockchainProofs.id, proof.id));

            logger.info('Blockchain proof confirmed', { proofId: proof.id, txId });
        } else {
            await db
                .update(blockchainProofs)
                .set({ status: 'failed' })
                .where(eq(blockchainProofs.id, proof.id));

            logger.warn('Blockchain proof failed — can be retried', { proofId: proof.id });
        }
    } catch (err) {
        // NEVER throw — this is fire-and-forget
        logger.error('createBlockchainProofAsync failed silently', {
            error: err instanceof Error ? err.message : String(err),
            userId,
            reflectionId,
        });
    }
}

/**
 * Retry a failed or pending blockchain proof.
 */
export async function retryBlockchainProof(proofId: string): Promise<{
    success: boolean;
    txId?: string;
    error?: string;
}> {
    try {
        const rows = await db
            .select()
            .from(blockchainProofs)
            .where(eq(blockchainProofs.id, proofId))
            .limit(1);

        if (!rows.length) return { success: false, error: 'Proof not found' };

        const proof = rows[0];
        if (proof.status === 'confirmed') {
            return { success: true, txId: proof.transactionId ?? undefined };
        }

        if (!isBlockchainEnabled()) {
            return { success: false, error: 'Blockchain not configured' };
        }

        const now = new Date();
        const txId = await submitOnChainRecord(
            proof.recordHash,
            Math.floor(now.getTime() / 1000)
        );

        if (txId) {
            await db
                .update(blockchainProofs)
                .set({ transactionId: txId, status: 'confirmed' })
                .where(eq(blockchainProofs.id, proofId));

            return { success: true, txId };
        }

        return { success: false, error: 'Transaction submission failed' };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

/**
 * Get all blockchain proofs for a user, newest first.
 */
export async function getProofsForUser(userId: string) {
    return db
        .select()
        .from(blockchainProofs)
        .where(eq(blockchainProofs.userId, userId))
        .orderBy(desc(blockchainProofs.createdAt));
}

/**
 * Verify a proof by re-computing the hash and comparing.
 */
export async function verifyProof(proofId: string): Promise<{
    verified: boolean;
    recordHash: string;
    transactionId: string | null;
    explorerUrl: string | null;
    error?: string;
}> {
    const rows = await db
        .select()
        .from(blockchainProofs)
        .where(eq(blockchainProofs.id, proofId))
        .limit(1);

    if (!rows.length) {
        return {
            verified: false,
            recordHash: '',
            transactionId: null,
            explorerUrl: null,
            error: 'Proof not found',
        };
    }

    const proof = rows[0];
    const explorerUrl = proof.transactionId
        ? getExplorerUrl(proof.transactionId)
        : null;

    return {
        verified: proof.status === 'confirmed' && !!proof.transactionId,
        recordHash: proof.recordHash,
        transactionId: proof.transactionId,
        explorerUrl,
    };
}
