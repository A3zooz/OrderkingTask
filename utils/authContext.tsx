import React, { createContext, useState, useEffect, ReactNode, use } from 'react';
import * as SecureStore from 'expo-secure-store';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'expo-router';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const TOKEN_KEY = 'authToken';
    const router = useRouter();

    const isTokenExpired = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000; // in seconds
            return decoded.exp < currentTime;
        } catch (error) {
            return true; // If token is invalid, consider it expired
        }
    };
    useEffect(() => {
        console.log('Checking for existing token...');
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync(TOKEN_KEY);
                console.log('Loaded token:', token);
                if (token && !isTokenExpired(token)) {
                    setIsAuthenticated(true);
                    setUser(jwtDecode(token));
                } else if (token) {
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                }
            } catch (error) {
                console.error('Error loading token:', error);
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    useEffect(() => {
        if(!isAuthenticated) return;
        const interval = setInterval(async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token && isTokenExpired(token)) {
                await logout();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = async (token: string) => {
        try{
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            setIsAuthenticated(true);
            setUser(jwtDecode(token));
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setIsAuthenticated(false);
            setUser(null);
            // router.replace('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};