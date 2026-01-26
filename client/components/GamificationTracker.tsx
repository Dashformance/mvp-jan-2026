"use client";

import { useGamification } from "@/hooks/useGamification";

/**
 * Componente invisível para inicializar e rastrear a gamificação globalmente
 * Garante que o Login Diário e Streaks sejam contados mesmo sem interagir com UI
 */
export function GamificationTracker() {
    // Apenas instanciar o hook já dispara os efeitos de inicialização (recordLogin)
    useGamification();

    return null;
}
