"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    name: string; // 'joao' | 'vitor'
}

interface AuthContextType {
    user: User | null;
    login: (name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('lead_extractor_user');
        if (storedUser) {
            setUser({ name: storedUser });
        }
        setLoading(false);
    }, []);

    const login = (name: string) => {
        localStorage.setItem('lead_extractor_user', name);
        setUser({ name });
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('lead_extractor_user');
        setUser(null);
        router.push('/login');
    };

    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
