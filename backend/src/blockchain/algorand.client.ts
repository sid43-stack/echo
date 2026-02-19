/**
 * Algorand Client
 *
 * Thin wrapper around the Algorand SDK.
 * Connects to Algorand Testnet via AlgoNode public API.
 * Provides helpers for smart-contract interaction.
 */

import algosdk from 'algosdk';
import { logger } from '../utils/logger';

// ── Testnet public endpoints (AlgoNode — no API key required) ──────────
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const ALGOD_TOKEN = ''; // AlgoNode public: no token needed

const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const INDEXER_PORT = 443;

// ── Env-driven config ──────────────────────────────────────────────────
const APP_ID = parseInt(process.env.ALGORAND_APP_ID || '0', 10);
const MNEMONIC = process.env.ALGORAND_MNEMONIC || '';
const NETWORK = process.env.ALGORAND_NETWORK || 'testnet';

// ── Clients ────────────────────────────────────────────────────────────
export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
export const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, INDEXER_PORT);

/**
 * Returns the deployed App ID. Zero means "not configured".
 */
export function getAppId(): number {
    return APP_ID;
}

/**
 * Returns the network name (testnet/mainnet).
 */
export function getNetwork(): string {
    return NETWORK;
}

/**
 * Recover the server-side signing account from the mnemonic.
 * Used to submit transactions on behalf of the app creator.
 */
export function getSignerAccount(): algosdk.Account | null {
    if (!MNEMONIC) {
        logger.warn('ALGORAND_MNEMONIC not configured — blockchain writes disabled');
        return null;
    }
    try {
        return algosdk.mnemonicToSecretKey(MNEMONIC);
    } catch (err) {
        logger.error('Invalid ALGORAND_MNEMONIC', { error: String(err) });
        return null;
    }
}

/**
 * Check if blockchain integration is properly configured.
 */
export function isBlockchainEnabled(): boolean {
    return APP_ID > 0 && !!MNEMONIC;
}

/**
 * Get Algorand Testnet explorer URL for a transaction.
 */
export function getExplorerUrl(txId: string): string {
    const base = NETWORK === 'mainnet'
        ? 'https://explorer.perawallet.app'
        : 'https://testnet.explorer.perawallet.app';
    return `${base}/tx/${txId}`;
}

logger.info('Algorand client initialized', {
    network: NETWORK,
    appId: APP_ID,
    enabled: isBlockchainEnabled(),
});
