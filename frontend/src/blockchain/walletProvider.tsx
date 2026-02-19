/**
 * Wallet Provider — React context for Algorand Pera Wallet integration.
 *
 * Provides wallet connect/disconnect, address state, and backend sync.
 * Wraps @perawallet/connect SDK.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import { api } from '../api';

// ── Types ──────────────────────────────────────────────────────────────

interface WalletContextValue {
    walletAddress: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue>({
    walletAddress: null,
    isConnected: false,
    isConnecting: false,
    connectWallet: async () => { },
    disconnectWallet: async () => { },
});

export const useWallet = () => useContext(WalletContext);

// ── Provider ───────────────────────────────────────────────────────────

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const peraWalletRef = useRef<PeraWalletConnect | null>(null);

    // Initialize Pera Wallet instance
    useEffect(() => {
        peraWalletRef.current = new PeraWalletConnect({
            chainId: 416002, // Algorand Testnet
        });

        // Try to reconnect from previous session
        peraWalletRef.current
            .reconnectSession()
            .then((accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    peraWalletRef.current?.connector?.on('disconnect', handleDisconnect);
                }
            })
            .catch(() => {
                // No previous session — ignore
            });

        // Also check backend for stored wallet
        api.blockchain.getWallet()
            .then((data) => {
                if (data.walletAddress) {
                    setWalletAddress(data.walletAddress);
                }
            })
            .catch(() => {
                // Not logged in or endpoint not available
            });

        return () => {
            peraWalletRef.current?.disconnect();
        };
    }, []);

    const handleDisconnect = useCallback(() => {
        setWalletAddress(null);
        api.blockchain.disconnectWallet().catch(() => { });
    }, []);

    const connectWallet = useCallback(async () => {
        if (!peraWalletRef.current) return;
        setIsConnecting(true);

        try {
            const accounts = await peraWalletRef.current.connect();
            if (accounts.length > 0) {
                const address = accounts[0];
                setWalletAddress(address);

                // Sync with backend
                await api.blockchain.connectWallet(address);

                // Listen for disconnect
                peraWalletRef.current.connector?.on('disconnect', handleDisconnect);
            }
        } catch (err) {
            // User cancelled or error
            console.error('Wallet connect error:', err);
        } finally {
            setIsConnecting(false);
        }
    }, [handleDisconnect]);

    const disconnectWallet = useCallback(async () => {
        if (!peraWalletRef.current) return;

        try {
            await peraWalletRef.current.disconnect();
            setWalletAddress(null);
            await api.blockchain.disconnectWallet();
        } catch (err) {
            console.error('Wallet disconnect error:', err);
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                isConnected: !!walletAddress,
                isConnecting,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
