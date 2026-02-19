/**
 * WalletButton Component
 *
 * Connect / disconnect Algorand wallet.
 * Styled to match Echo's dark theme aesthetic.
 */

import { motion } from 'framer-motion';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useWallet } from './walletProvider';

function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletButton() {
    const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

    if (isConnecting) {
        return (
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-secondary/30 border border-border/20
                           text-muted-foreground text-sm cursor-wait"
                disabled
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
            </motion.button>
        );
    }

    if (isConnected && walletAddress) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                                bg-emerald-500/10 border border-emerald-500/20
                                text-emerald-400 text-xs font-mono">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {truncateAddress(walletAddress)}
                </div>
                <button
                    onClick={disconnectWallet}
                    className="p-1.5 rounded-lg text-muted-foreground/50
                               hover:text-red-400 hover:bg-red-500/10
                               transition-all duration-200"
                    title="Disconnect wallet"
                >
                    <LogOut className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectWallet}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-primary/10 border border-primary/20
                       hover:bg-primary/15 hover:border-primary/30
                       text-primary text-sm font-medium
                       transition-all duration-200"
        >
            <Wallet className="w-4 h-4" />
            Connect Wallet
        </motion.button>
    );
}
