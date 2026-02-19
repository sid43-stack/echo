import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AccountData } from '../types/account';

/**
 * Account Context
 * 
 * Provides global access to account data with local storage persistence.
 * No authentication - frontend-only, optional user personalization.
 */

const STORAGE_KEY = 'havenly_account';

interface AccountContextType {
    account: AccountData;
    updateAccount: (data: Partial<AccountData>) => void;
    clearAccount: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<AccountData>(() => {
        // Load from local storage on mount
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load account data:', error);
            return {};
        }
    });

    // Sync to local storage whenever account changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
        } catch (error) {
            console.error('Failed to save account data:', error);
        }
    }, [account]);

    const updateAccount = (data: Partial<AccountData>) => {
        setAccount(prev => ({ ...prev, ...data }));
    };

    const clearAccount = () => {
        setAccount({});
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AccountContext.Provider value={{ account, updateAccount, clearAccount }}>
            {children}
        </AccountContext.Provider>
    );
}

export function useAccount() {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
}
