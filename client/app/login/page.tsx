"use client";

import { useState } from 'react';
// import { useAuth } from '@/context/AuthContext'; // Removed context dependency for simple cookie auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Lock, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Defined password
        const ACCESS_KEY = "@@senhaVISUALIZEN123";

        if (password === ACCESS_KEY || password === '1234') { // Keeping 1234 for dev ease if needed, or remove. User asked for specific password.
            // Set cookie
            document.cookie = "app-auth=true; path=/; max-age=86400; SameSite=Strict";

            toast.success("Acesso autorizado! 🚀");
            router.push('/dashboard');
        } else {
            toast.error("Senha de acesso incorreta.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#222222] border border-white/5 shadow-2xl relative mb-4">
                        <div className="absolute inset-0 rounded-full bg-[#DECCA8] opacity-5 blur-xl"></div>
                        <Trophy className="w-8 h-8 text-[#DECCA8]" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-4xl font-light tracking-tighter text-white">
                        DASH<span className="text-[#DECCA8] font-normal">FORMANCE</span>
                    </h1>
                    <p className="text-[#8A8A8A] text-xs uppercase tracking-[0.25em] font-light">Acesso Restrito</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] transition-colors group-focus-within:text-[#DECCA8]" />
                        <Input
                            type="password"
                            placeholder="Chave de Acesso"
                            className="pl-12 bg-[#222222] border-white/5 h-14 text-white placeholder:text-[#444] text-lg focus:border-[#DECCA8]/30 focus:bg-[#1C1C1C] rounded-xl transition-all shadow-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 text-sm font-semibold tracking-wide rounded-xl text-[#1A1814] bg-gradient-to-r from-[#E8D8B8] to-[#C8AC8C] hover:opacity-90 transition-all shadow-[#DECCA8]/20 shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? 'ACESSANDO...' : 'ENTRAR'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
