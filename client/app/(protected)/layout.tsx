"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { GameDebugPanel } from "@/components/GameDebugPanel"
import { GamificationTracker } from "@/components/GamificationTracker"

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#181818]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    return (
        <>
            {children}
            <GamificationTracker />
        </>
    )
}
