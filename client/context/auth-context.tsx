"use client"

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
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

    // Use useMemo to ensure we get a stable reference to supabase client
    const supabase = useMemo(() => createClient(), [])

    const fetchProfile = useCallback(async () => {
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
    }, [])

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        // Get initial session immediately
        const initSession = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession()
                console.log('[Auth] Initial session:', initialSession ? 'present' : 'none')

                setSession(initialSession)
                setUser(initialSession?.user ?? null)

                if (initialSession?.user) {
                    await fetchProfile()
                }
            } catch (error) {
                console.error('[Auth] Failed to get initial session:', error)
            } finally {
                setLoading(false)
            }
        }

        initSession()

        // Subscribe to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
            console.log(`[Auth] Event: ${event}`, session ? 'has session' : 'no session');

            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await fetchProfile()
            } else {
                setProfile(null)
            }

            // Handle token refresh
            if (event === 'TOKEN_REFRESHED') {
                console.log('✅ Token renovado automaticamente')
            }

            if (event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, fetchProfile, router])


    const value = useMemo(() => ({
        user,
        profile,
        session,
        loading,
        signInWithGoogle: async () => {
            if (!supabase) return
            await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                },
            })
        },
        signInWithEmail: async (email: string, password: string) => {
            if (!supabase) return { error: { message: "Supabase client not initialized" } }
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (!error) {
                // Force full page navigation to ensure cookies are sent correctly
                window.location.href = "/"
            }
            return { error }
        },
        signOut: async () => {
            if (!supabase) return
            await supabase.auth.signOut()
            setProfile(null)
            router.push("/login")
        },
        refreshProfile: fetchProfile
    }), [user, profile, session, loading, fetchProfile, router, supabase])

    return (
        <AuthContext.Provider value={value}>
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
