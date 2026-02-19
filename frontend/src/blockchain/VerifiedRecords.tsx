/**
 * VerifiedRecords Component
 *
 * Displays blockchain proof records for conversation reflections.
 * Shows verification status, transaction IDs, and explorer links.
 * Additive — does not modify any existing Memory page components.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldX, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../api';

interface BlockchainProof {
    id: string;
    reflectionId: string;
    userId: string;
    recordHash: string;
    transactionId: string | null;
    appId: string | null;
    status: string;
    createdAt: string;
}

interface VerifyResult {
    verified: boolean;
    recordHash: string;
    transactionId: string | null;
    explorerUrl: string | null;
    error?: string;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function truncateHash(hash: string): string {
    return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

function truncateTx(tx: string): string {
    return `${tx.slice(0, 8)}…${tx.slice(-6)}`;
}

function getExplorerUrl(txId: string): string {
    return `https://testnet.explorer.perawallet.app/tx/${txId}`;
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Verified
            </span>
        );
    }
    if (status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldX className="w-3 h-3" />
                Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                         text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Shield className="w-3 h-3" />
            Pending
        </span>
    );
}

export default function VerifiedRecords() {
    const [proofs, setProofs] = useState<BlockchainProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);
    const [retrying, setRetrying] = useState<string | null>(null);
    const [verifyResult, setVerifyResult] = useState<Record<string, VerifyResult>>({});

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await api.blockchain.getProofs();
                if (active) setProofs(data);
            } catch {
                // silently fail
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const handleVerify = async (proofId: string) => {
        setVerifying(proofId);
        try {
            const result = await api.blockchain.verifyProof(proofId);
            setVerifyResult((prev) => ({ ...prev, [proofId]: result }));
        } catch {
            setVerifyResult((prev) => ({
                ...prev,
                [proofId]: {
                    verified: false,
                    recordHash: '',
                    transactionId: null,
                    explorerUrl: null,
                    error: 'Verification failed',
                },
            }));
        } finally {
            setVerifying(null);
        }
    };

    const handleRetry = async (proofId: string) => {
        setRetrying(proofId);
        try {
            const result = await api.blockchain.retryProof(proofId);
            if (result.success) {
                // Refresh proofs list
                const data = await api.blockchain.getProofs();
                setProofs(data);
            }
        } catch {
            // silently fail
        } finally {
            setRetrying(null);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground/50 py-4 text-center">
                Loading blockchain records…
            </div>
        );
    }

    if (proofs.length === 0) {
        return (
            <div className="p-5 rounded-2xl bg-secondary/10 border border-border/15">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground/40" />
                    <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider">
                        Blockchain Verification
                    </span>
                </div>
                <p className="text-sm text-muted-foreground/50">
                    No verified records yet. Connect your wallet and have a conversation
                    — your reflections will be verified on Algorand.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Verified Records — Algorand Testnet
            </h2>

            <div className="space-y-3">
                {proofs.map((proof, index) => {
                    const result = verifyResult[proof.id];

                    return (
                        <motion.div
                            key={proof.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-2xl bg-secondary/15 border border-border/15"
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-3">
                                <StatusBadge status={proof.status} />
                                <span className="text-[10px] text-muted-foreground/40">
                                    {formatDate(proof.createdAt)}
                                </span>
                            </div>

                            {/* Hash */}
                            <div className="mb-2">
                                <span className="text-[10px] text-muted-foreground/40 block mb-0.5">
                                    Record Hash
                                </span>
                                <span className="text-xs font-mono text-foreground/70">
                                    {truncateHash(proof.recordHash)}
                                </span>
                            </div>

                            {/* Transaction ID */}
                            {proof.transactionId && (
                                <div className="mb-3">
                                    <span className="text-[10px] text-muted-foreground/40 block mb-0.5">
                                        Transaction ID
                                    </span>
                                    <a
                                        href={getExplorerUrl(proof.transactionId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-mono
                                                   text-primary/70 hover:text-primary transition-colors"
                                    >
                                        {truncateTx(proof.transactionId)}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                                {proof.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleVerify(proof.id)}
                                        disabled={verifying === proof.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                                   text-[11px] font-medium
                                                   bg-primary/8 hover:bg-primary/12
                                                   text-primary/70 hover:text-primary
                                                   border border-primary/10 hover:border-primary/20
                                                   transition-all duration-200
                                                   disabled:opacity-50"
                                    >
                                        {verifying === proof.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <ShieldCheck className="w-3 h-3" />
                                        )}
                                        Verify on Algorand
                                    </button>
                                )}

                                {(proof.status === 'failed' || proof.status === 'pending') && (
                                    <button
                                        onClick={() => handleRetry(proof.id)}
                                        disabled={retrying === proof.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                                   text-[11px] font-medium
                                                   bg-yellow-500/8 hover:bg-yellow-500/12
                                                   text-yellow-400/70 hover:text-yellow-400
                                                   border border-yellow-500/10 hover:border-yellow-500/20
                                                   transition-all duration-200
                                                   disabled:opacity-50"
                                    >
                                        {retrying === proof.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3" />
                                        )}
                                        Retry
                                    </button>
                                )}
                            </div>

                            {/* Verification result */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 pt-3 border-t border-border/10"
                                >
                                    {result.verified ? (
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>✅ Hash matches on-chain record — Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400 text-xs">
                                            <ShieldX className="w-4 h-4" />
                                            <span>
                                                {result.error || 'Hash mismatch — record may have been tampered with'}
                                            </span>
                                        </div>
                                    )}
                                    {result.explorerUrl && (
                                        <a
                                            href={result.explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 text-[11px]
                                                       text-primary/60 hover:text-primary transition-colors"
                                        >
                                            View on Algorand Explorer
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
