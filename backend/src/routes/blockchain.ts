/**
 * Blockchain Routes
 *
 * Endpoints for wallet connection, proof retrieval, and verification.
 * All routes require JWT authentication.
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../db/drizzle';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import {
    getProofsForUser,
    verifyProof,
    retryBlockchainProof,
} from '../blockchain/proof.service';
import { getAppId, getNetwork, isBlockchainEnabled, getExplorerUrl } from '../blockchain/algorand.client';
import { logger } from '../utils/logger';

const router: Router = Router();

// All blockchain routes require authentication
router.use(authenticate);

// ── Wallet management ──────────────────────────────────────────────────

/**
 * POST /blockchain/connect-wallet
 * Store user's Algorand wallet address.
 */
router.post('/connect-wallet', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const { walletAddress } = req.body as { walletAddress?: string };
        if (!walletAddress || typeof walletAddress !== 'string') {
            res.status(400).json({ error: 'walletAddress is required' });
            return;
        }

        await db
            .update(users)
            .set({ walletAddress })
            .where(eq(users.id, userId));

        logger.info('Wallet connected', { userId, walletAddress });
        res.json({ success: true, walletAddress });
    } catch (error) {
        logger.error('Connect wallet error', { error: String(error) });
        res.status(500).json({ error: 'Failed to connect wallet' });
    }
});

/**
 * GET /blockchain/wallet
 * Get connected wallet address for the authenticated user.
 */
router.get('/wallet', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const walletAddress = rows[0]?.walletAddress ?? null;

        res.json({ walletAddress });
    } catch (error) {
        logger.error('Get wallet error', { error: String(error) });
        res.status(500).json({ error: 'Failed to get wallet' });
    }
});

/**
 * POST /blockchain/disconnect-wallet
 * Clear user's wallet address.
 */
router.post('/disconnect-wallet', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        await db
            .update(users)
            .set({ walletAddress: null })
            .where(eq(users.id, userId));

        logger.info('Wallet disconnected', { userId });
        res.json({ success: true });
    } catch (error) {
        logger.error('Disconnect wallet error', { error: String(error) });
        res.status(500).json({ error: 'Failed to disconnect wallet' });
    }
});

// ── Proofs ──────────────────────────────────────────────────────────────

/**
 * GET /blockchain/proofs
 * Get all blockchain proofs for the authenticated user.
 */
router.get('/proofs', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const proofs = await getProofsForUser(userId);
        res.json(proofs);
    } catch (error) {
        logger.error('Get proofs error', { error: String(error) });
        res.status(500).json({ error: 'Failed to get proofs' });
    }
});

/**
 * POST /blockchain/verify/:proofId
 * Verify a specific proof against on-chain data.
 */
router.post('/verify/:proofId', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const result = await verifyProof(req.params.proofId);
        res.json(result);
    } catch (error) {
        logger.error('Verify proof error', { error: String(error) });
        res.status(500).json({ error: 'Failed to verify proof' });
    }
});

/**
 * POST /blockchain/retry/:proofId
 * Retry a failed or pending blockchain write.
 */
router.post('/retry/:proofId', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const result = await retryBlockchainProof(req.params.proofId);
        res.json(result);
    } catch (error) {
        logger.error('Retry proof error', { error: String(error) });
        res.status(500).json({ error: 'Failed to retry proof' });
    }
});

// ── Status ─────────────────────────────────────────────────────────────

/**
 * GET /blockchain/status
 * Returns blockchain integration configuration status.
 */
router.get('/status', (_req: Request, res: Response) => {
    res.json({
        enabled: isBlockchainEnabled(),
        network: getNetwork(),
        appId: getAppId(),
    });
});

export default router;
