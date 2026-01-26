"use client";

import { KanbanProvider } from "@/components/kanban/KanbanProvider";
import { KanbanView } from "@/components/kanban/KanbanView";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gauge, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-bg-void flex flex-col font-sans text-white overflow-y-auto custom-scrollbar">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-[1920px] mx-auto w-full space-y-6">

        {/* Tier 0: Header & Gamification */}
        <div className="flex flex-col gap-6">
          <PageHeader />

          {/* Superdash Access Button - Prominent */}
          {isAdmin && (
            <Link href="/super-dash">
              <div className="group relative overflow-hidden bg-linear-to-r from-accent/20 via-accent/10 to-transparent border border-accent/30 rounded-xl p-4 cursor-pointer hover:border-accent/50 transition-all hover:shadow-[0_0_40px_rgba(222,204,168,0.2)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Gauge className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">SUPERDASH</h3>
                        <span className="px-2 py-0.5 rounded-full bg-neon-green-bg text-neon-green-soft text-[10px] font-bold uppercase">Live</span>
                      </div>
                      <p className="text-sm text-text-muted">Performance Cockpit • Visão completa da equipe em tempo real</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle">
                      <TrendingUp className="w-4 h-4 text-neon-green-soft" />
                      <span className="text-xs text-text-secondary font-medium">Pace: Excelente</span>
                    </div>
                    <Button className="bg-accent text-bg-void hover:bg-accent-light font-bold group-hover:scale-105 transition-transform">
                      <Zap className="w-4 h-4 mr-2" />
                      Acessar
                    </Button>
                  </div>
                </div>
                {/* Animated gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-accent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          )}
        </div>

        {/* Tier 3: Work Area (The Pipeline) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-neon-green-soft shadow-[0_0_10px_#22C55E]" />
            <h2 className="text-sm font-medium text-text-muted tracking-wide uppercase">Pipeline Ativo</h2>
          </div>

          <div className="h-[calc(100vh-300px)] min-h-[500px] w-full">
            <KanbanProvider>
              <KanbanView />
            </KanbanProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
