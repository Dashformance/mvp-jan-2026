"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { submitLoginV6 } from './action';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await submitLoginV6(formData);
            if (result && result.error) {
                toast.error(result.error);
                setLoading(false);
            } else if (result && result.success) {
                toast.success("Acesso autorizado!");
                // HARD REDIRECT
                window.location.href = '/dashboard';
            }
        } catch (e: any) {
            console.error("Login fail:", e);
            toast.error("Erro interno. Tente novamente.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <Trophy className="w-12 h-12 text-[#DECCA8] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white uppercase italic tracking-tighter">
                        Dash<span className="text-[#DECCA8]">formance</span>
                    </h1>
                </div>

                <div className="bg-[#1C1C1C] border border-white/5 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#666] font-bold">
                                Chave de Acesso
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Senha"
                                    className="pl-12 bg-black/50 border-white/5 h-14 text-white focus:border-[#DECCA8]/20 rounded-xl"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 font-black uppercase tracking-widest rounded-xl text-black bg-[#DECCA8] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
