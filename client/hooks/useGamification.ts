// ============================================
// DASHFORMANCE - useGamification Hook
// Sprint 03: Superdash Logic RPG
// ============================================

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from './useGameStore';
import {
    getLevelInfo,
    getLevelTitle,
    getNextBadges,
    getUnlockedBadges,
    getBadgeStats,
} from '@/lib/gamification';
import type { ActionType } from '@/lib/gamification';

/**
 * Hook principal de gamificação
 * Provê interface simplificada para o sistema RPG
 */
export function useGamification() {
    // Selectors do store
    const totalXP = useGameStore((s) => s.totalXP);
    const level = useGameStore((s) => s.level);
    const combo = useGameStore((s) => s.combo);
    const stats = useGameStore((s) => s.stats);
    const unlockedBadgeIds = useGameStore((s) => s.unlockedBadges);
    const lastLoginDate = useGameStore((s) => s.lastLoginDate);

    // Actions do store
    const storeAddXP = useGameStore((s) => s.addXP);
    const recordLogin = useGameStore((s) => s.recordLogin);
    const incrementStat = useGameStore((s) => s.incrementStat);
    const updateStats = useGameStore((s) => s.updateStats);
    const checkComboDecay = useGameStore((s) => s.checkComboDecay);
    const resetGame = useGameStore((s) => s.resetGame);
    const getDebugInfo = useGameStore((s) => s.getDebugInfo);

    // Registra login ao montar o componente
    useEffect(() => {
        recordLogin();
    }, [recordLogin]);

    // Verifica decay do combo periodicamente
    useEffect(() => {
        const interval = setInterval(() => {
            checkComboDecay();
        }, 30000); // Verifica a cada 30 segundos

        return () => clearInterval(interval);
    }, [checkComboDecay]);

    // Informações de nível derivadas
    const levelInfo = useMemo(() => getLevelInfo(totalXP), [totalXP]);
    const levelTitle = useMemo(() => getLevelTitle(level), [level]);

    // Badges
    const unlockedBadges = useMemo(
        () => getUnlockedBadges(unlockedBadgeIds),
        [unlockedBadgeIds]
    );

    const nextBadges = useMemo(
        () => getNextBadges(stats, unlockedBadgeIds, 3),
        [stats, unlockedBadgeIds]
    );

    const badgeStats = useMemo(
        () => getBadgeStats(unlockedBadgeIds),
        [unlockedBadgeIds]
    );

    /**
     * Adiciona XP para uma ação
     * Wrapper que também atualiza estatísticas relevantes
     */
    const addXP = useCallback((actionType: ActionType) => {
        const result = storeAddXP(actionType);

        // Atualiza estatísticas baseado na ação
        switch (actionType) {
            case 'LEAD_CREATED':
                incrementStat('totalLeadsCreated');
                break;
            case 'LEAD_QUALIFIED':
                incrementStat('totalLeadsQualified');
                break;
            case 'LEAD_CONVERTED':
                incrementStat('totalLeadsConverted');
                incrementStat('conversionsToday');
                break;
            case 'LEAD_CONTACTED':
                incrementStat('leadsContactedToday');
                break;
            case 'TASK_COMPLETED':
                incrementStat('totalTasksCompleted');
                break;
        }

        return result;
    }, [storeAddXP, incrementStat]);

    /**
     * Adiciona XP para importação em massa
     */
    const addBulkImportXP = useCallback((leadCount: number) => {
        // Adiciona XP por cada lead importado
        let totalXPGained = 0;

        for (let i = 0; i < leadCount; i++) {
            const result = storeAddXP('BULK_IMPORT');
            totalXPGained += result.xpGained;
        }

        // Atualiza estatística de leads criados
        updateStats({
            totalLeadsCreated: stats.totalLeadsCreated + leadCount,
        });

        return {
            totalXPGained,
            leadsImported: leadCount,
        };
    }, [storeAddXP, updateStats, stats.totalLeadsCreated]);

    return {
        // Estado
        totalXP,
        level,
        levelTitle,
        levelInfo,
        combo,
        stats,
        lastLoginDate,

        // Badges
        unlockedBadges,
        unlockedBadgeIds,
        nextBadges,
        badgeStats,

        // Actions
        addXP,
        addBulkImportXP,
        updateStats,
        incrementStat,
        resetGame,

        // Debug (apenas em dev)
        ...(process.env.NODE_ENV === 'development' && {
            getDebugInfo,
        }),
    };
}

// Export type para uso externo
export type UseGamificationReturn = ReturnType<typeof useGamification>;
