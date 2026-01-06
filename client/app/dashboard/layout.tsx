"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();

    // Explicit protection (though AuthContext also handles it, this is a double check for the layout specifically)
    useEffect(() => {
        const storedUser = localStorage.getItem('lead_extractor_user');
        if (!storedUser && !user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user && typeof window !== 'undefined' && !localStorage.getItem('lead_extractor_user')) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#181818] text-white">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
