"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    name: string;
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

    useEffect(() => {
        const storedUser = localStorage.getItem('lead_extractor_user');
        if (storedUser) {
            setUser({ name: storedUser });
        }
    }, []);

    const login = (name: string) => {
        localStorage.setItem('lead_extractor_user', name);
        setUser({ name: name });
        window.location.href = '/dashboard';
    };

    const logout = () => {
        localStorage.removeItem('lead_extractor_user');
        document.cookie = "app-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
        window.location.href = '/login';
    };

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
