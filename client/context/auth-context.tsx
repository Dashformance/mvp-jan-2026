"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { type User, type Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
    user: User | null
    profile: {
        id: string;
        email: string;
        name: string;
        role: string;
    } | null
    session: Session | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
            } else {
                setProfile(null)
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            setProfile(null)
        }
    }

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await fetchProfile()
            } else {
                setProfile(null)
            }

            setLoading(false)

            if (_event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps


    const signInWithGoogle = async () => {
        if (!supabase) return
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        })
    }

    const signInWithEmail = async (email: string, password: string) => {
        if (!supabase) return { error: { message: "Supabase client not initialized" } }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (!error) {
            await fetchProfile()
            router.push("/")
        }
        return { error }
    }

    const signOut = async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        setProfile(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signInWithGoogle, signInWithEmail, signOut, refreshProfile: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
