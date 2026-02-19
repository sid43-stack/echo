/**
 * User State Context
 *
 * Fetches /user-state/me after login and provides the user's state
 * (streak, mood, energy, summary, etc.) to the entire app via React context.
 *
 * Does NOT modify existing auth logic.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';
import type { UserStateRecord } from '../api/client';

interface UserStateContextType {
    userState: UserStateRecord | null;
    loading: boolean;
    error: string | null;
    refreshUserState: () => Promise<void>;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

export function UserStateProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [userState, setUserState] = useState<UserStateRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserState = useCallback(async () => {
        if (!isAuthenticated) {
            setUserState(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const state = await api.userState.me();
            setUserState(state);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load user state';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch on auth change
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return ; 
        fetchUserState();
    }, [fetchUserState]);

    const value: UserStateContextType = {
        userState,
        loading,
        error,
        refreshUserState: fetchUserState,
    };

    return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
}

export function useUserState() {
    const context = useContext(UserStateContext);
    if (context === undefined) {
        throw new Error('useUserState must be used within a UserStateProvider');
    }
    return context;
}
