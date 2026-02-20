/**
 * Wallet Provider — React context for Algorand Pera Wallet integration.
 * FIXED: Prevents unauthorized backend calls before login.
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

    // IMPORTANT: detect login state
    const isLoggedIn = () => !!localStorage.getItem('token');

    // Initialize Pera Wallet instance
    useEffect(() => {
        peraWalletRef.current = new PeraWalletConnect({
            chainId: 416002, // Algorand Testnet
        });

        // Restore wallet session (local wallet only — SAFE)
        peraWalletRef.current
            .reconnectSession()
            .then((accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    peraWalletRef.current?.connector?.on('disconnect', handleDisconnect);
                }
            })
            .catch(() => {
                // no previous wallet session
            });

        // 🔴 CRITICAL FIX
        // Only contact backend if user is authenticated
        if (isLoggedIn()) {
            api.blockchain.getWallet()
                .then((data) => {
                    if (data.walletAddress) {
                        setWalletAddress(data.walletAddress);
                    }
                })
                .catch(() => {
                    // ignore — not fatal
                });
        }

        return () => {
            peraWalletRef.current?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDisconnect = useCallback(() => {
        setWalletAddress(null);

        // Only notify backend if logged in
        if (isLoggedIn()) {
            api.blockchain.disconnectWallet().catch(() => { });
        }
    }, []);

    const connectWallet = useCallback(async () => {
        if (!peraWalletRef.current) return;

        // 🔴 prevent wallet connection before login
        if (!isLoggedIn()) {
            alert('Please login first before connecting wallet.');
            return;
        }

        setIsConnecting(true);

        try {
            const accounts = await peraWalletRef.current.connect();
            if (accounts.length > 0) {
                const address = accounts[0];
                setWalletAddress(address);

                // Sync with backend (safe now)
                await api.blockchain.connectWallet(address);

                peraWalletRef.current.connector?.on('disconnect', handleDisconnect);
            }
        } catch (err) {
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

            if (isLoggedIn()) {
                await api.blockchain.disconnectWallet();
            }
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
