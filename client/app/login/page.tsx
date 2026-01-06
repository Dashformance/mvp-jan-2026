"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Shield, Zap, Lock } from 'lucide-react';
import { toast } from "sonner";

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [pin, setPin] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        // Simple PIN check
        if (pin === '1234') {
            login(selectedUser);
            toast.success(`Bem-vindo, ${selectedUser === 'vitor' ? 'Vitor' : 'João'}! 🚀`);
        } else {
            toast.error('PIN incorreto');
        }
    };

    return (
        <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4 font-sans">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-16 space-y-2">
                    {/* Logo Icon Style - Cartesia Sonic Gloom */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#222222] border border-white/5 mb-6 shadow-2xl relative">
                        <div className="absolute inset-0 rounded-full bg-[#DECCA8] opacity-5 blur-xl"></div>
                        <Trophy className="w-6 h-6 text-[#DECCA8]" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
                        DASH<span className="text-[#DECCA8] font-normal">FORMANCE</span>
                    </h1>
                    <p className="text-[#8A8A8A] text-xs uppercase tracking-[0.25em] font-light">Selecione seu Player</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Player 1: João */}
                    <div
                        onClick={() => { setSelectedUser('joao'); setPin(''); }}
                        className={`group relative cursor-pointer transition-all duration-300 ${selectedUser === 'joao' ? 'transform -translate-y-2' : 'hover:-translate-y-1'}`}
                    >
                        {/* Active Glow */}
                        <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b from-[#DECCA8] to-transparent opacity-0 transition-opacity duration-500 ${selectedUser === 'joao' ? 'opacity-30' : 'group-hover:opacity-10'}`} />

                        <Card className="relative h-full bg-[#222222] border border-white/5 data-[selected=true]:border-[#DECCA8]/40 overflow-hidden rounded-2xl transition-all duration-300" data-selected={selectedUser === 'joao'}>
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium transition-all duration-300 ${selectedUser === 'joao' ? 'bg-[#DECCA8] text-[#181818]' : 'bg-[#181818] text-[#8A8A8A] border border-white/5'}`}>
                                    J
                                </div>
                                <div className="space-y-2">
                                    <h3 className={`text-xl font-medium tracking-tight transition-colors ${selectedUser === 'joao' ? 'text-white' : 'text-[#8A8A8A]'}`}>João</h3>
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] bg-[#181818] py-1.5 px-4 rounded-full border border-white/5 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Administrator
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Player 2: Vitor */}
                    <div
                        onClick={() => { setSelectedUser('vitor'); setPin(''); }}
                        className={`group relative cursor-pointer transition-all duration-300 ${selectedUser === 'vitor' ? 'transform -translate-y-2' : 'hover:-translate-y-1'}`}
                    >
                        {/* Active Glow */}
                        <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b from-[#73BA7F] to-transparent opacity-0 transition-opacity duration-500 ${selectedUser === 'vitor' ? 'opacity-30' : 'group-hover:opacity-10'}`} />

                        <Card className="relative h-full bg-[#222222] border border-white/5 data-[selected=true]:border-[#73BA7F]/40 overflow-hidden rounded-2xl transition-all duration-300" data-selected={selectedUser === 'vitor'}>
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium transition-all duration-300 ${selectedUser === 'vitor' ? 'bg-[#73BA7F] text-white' : 'bg-[#181818] text-[#8A8A8A] border border-white/5'}`}>
                                    V
                                </div>
                                <div className="space-y-2">
                                    <h3 className={`text-xl font-medium tracking-tight transition-colors ${selectedUser === 'vitor' ? 'text-white' : 'text-[#8A8A8A]'}`}>Vitor Nitz</h3>
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] bg-[#181818] py-1.5 px-4 rounded-full border border-white/5 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Sales Leader
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* PIN Input Area */}
                <div className={`max-w-[280px] mx-auto mt-16 transition-all duration-500 ease-out ${selectedUser ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] transition-colors group-focus-within:text-[#DECCA8]" />
                            <Input
                                type="password"
                                placeholder="PIN"
                                className="pl-12 bg-[#222222] border-white/5 h-14 text-center text-lg tracking-[0.5em] focus:border-[#DECCA8]/30 focus:bg-[#1C1C1C] rounded-full transition-all shadow-lg"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={4}
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className={`w-full h-14 text-sm font-semibold tracking-wide rounded-full text-[#1A1814] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl ${selectedUser === 'vitor'
                                    ? 'bg-gradient-to-r from-[#73BA7F] to-[#098545] text-white shadow-[#73BA7F]/20'
                                    : 'bg-gradient-to-r from-[#E8D8B8] to-[#C8AC8C] shadow-[#DECCA8]/20'
                                }`}
                        >
                            ENTRAR
                        </Button>

                        <p className="text-center text-[10px] text-[#444444] uppercase tracking-[0.2em] font-medium">PIN Padrão: 1234</p>
                    </form>
                </div>
            </div>
        </div>
    );
}
