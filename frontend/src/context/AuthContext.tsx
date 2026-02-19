import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';

/**
 * Auth Context
 * 
 * Provides JWT authentication state and methods.
 * Handles token persistence via localStorage.
 * Separate from AccountContext (which is for user preferences).
 */

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // Restore session on mount
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.auth.login(email, password);
        // Token is automatically saved by api.auth.login
        setToken(response.token);
    };

    const register = async (email: string, password: string, name?: string) => {
        const response = await api.auth.register(email, password, name);
        // Token is automatically saved by api.auth.register
        setToken(response.token);
    };

    const logout = () => {
        api.auth.logout();
        setToken(null);
    };

    const value: AuthContextType = {
        token,
        isAuthenticated: token !== null,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
