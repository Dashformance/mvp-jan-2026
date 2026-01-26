// ============================================
// DASHFORMANCE - Badges System
// Sprint 03: Superdash Logic RPG
// ============================================

import { BADGES_CONFIG } from './config';
import type { Badge, UserStats } from './types';

/**
 * Verifica quais badges foram desbloqueados baseado nas estatísticas
 * 
 * @param stats - Estatísticas atuais do usuário
 * @param unlockedIds - IDs dos badges já desbloqueados
 * @returns Lista de novos badges desbloqueados
 */
export function checkBadges(
    stats: UserStats,
    unlockedIds: string[] = []
): Badge[] {
    const newBadges: Badge[] = [];

    for (const badge of BADGES_CONFIG) {
        // Pula se já foi desbloqueado
        if (unlockedIds.includes(badge.id)) continue;

        // Verifica se atende ao requisito
        if (badge.requirement(stats)) {
            newBadges.push(badge);
        }
    }

    return newBadges;
}

/**
 * Retorna todos os badges já desbloqueados
 */
export function getUnlockedBadges(unlockedIds: string[]): Badge[] {
    return BADGES_CONFIG.filter(badge => unlockedIds.includes(badge.id));
}

/**
 * Retorna badges não desbloqueados (para mostrar progresso)
 */
export function getLockedBadges(unlockedIds: string[]): Badge[] {
    return BADGES_CONFIG.filter(badge => !unlockedIds.includes(badge.id));
}

/**
 * Retorna os próximos badges mais "próximos" de serem desbloqueados
 * Útil para gamificação e mostrar próximas metas
 */
export function getNextBadges(
    stats: UserStats,
    unlockedIds: string[],
    limit: number = 3
): Array<{ badge: Badge; progress: number }> {
    const locked = getLockedBadges(unlockedIds);

    // Calcula progresso aproximado para cada badge
    const withProgress = locked.map(badge => {
        const progress = estimateBadgeProgress(badge, stats);
        return { badge, progress };
    });

    // Ordena por progresso (mais próximo primeiro) e tier
    withProgress.sort((a, b) => {
        // Primeiro por progresso (maior primeiro)
        if (b.progress !== a.progress) return b.progress - a.progress;
        // Depois por tier (menor tier primeiro)
        const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
        return tierOrder[a.badge.tier] - tierOrder[b.badge.tier];
    });

    return withProgress.slice(0, limit);
}

/**
 * Estima o progresso para um badge (0-100)
 * Isso é uma aproximação baseada em heurísticas
 */
function estimateBadgeProgress(badge: Badge, stats: UserStats): number {
    // Tenta inferir o threshold do badge baseado na descrição/id
    const id = badge.id;

    // Badges de leads
    if (id === 'first_lead') return Math.min(100, stats.totalLeadsCreated * 100);
    if (id === 'lead_hunter') return Math.min(100, (stats.totalLeadsCreated / 50) * 100);
    if (id === 'lead_master') return Math.min(100, (stats.totalLeadsCreated / 500) * 100);
    if (id === 'lead_legend') return Math.min(100, (stats.totalLeadsCreated / 2000) * 100);

    // Badges de conversão
    if (id === 'first_blood') return Math.min(100, stats.totalLeadsConverted * 100);
    if (id === 'closer') return Math.min(100, (stats.totalLeadsConverted / 10) * 100);
    if (id === 'deal_maker') return Math.min(100, (stats.totalLeadsConverted / 50) * 100);
    if (id === 'sales_machine') return Math.min(100, (stats.totalLeadsConverted / 200) * 100);

    // Badges de streak
    if (id === 'consistent') return Math.min(100, (stats.currentStreak / 7) * 100);
    if (id === 'dedicated') return Math.min(100, (stats.currentStreak / 30) * 100);
    if (id === 'unstoppable') return Math.min(100, (stats.currentStreak / 90) * 100);

    // Badges de milestone
    if (id === 'qualifier') return Math.min(100, (stats.totalLeadsQualified / 25) * 100);
    if (id === 'task_master') return Math.min(100, (stats.totalTasksCompleted / 100) * 100);
    if (id === 'daily_warrior') return Math.min(100, (stats.leadsContactedToday / 10) * 100);

    // Fallback
    return 0;
}

/**
 * Retorna badges agrupados por categoria
 */
export function getBadgesByCategory(unlockedIds: string[]): Record<string, { unlocked: Badge[]; locked: Badge[] }> {
    const categories: Record<string, { unlocked: Badge[]; locked: Badge[] }> = {
        leads: { unlocked: [], locked: [] },
        conversion: { unlocked: [], locked: [] },
        streak: { unlocked: [], locked: [] },
        milestone: { unlocked: [], locked: [] },
    };

    for (const badge of BADGES_CONFIG) {
        const isUnlocked = unlockedIds.includes(badge.id);
        const list = isUnlocked ? categories[badge.category].unlocked : categories[badge.category].locked;
        list.push(badge);
    }

    return categories;
}

/**
 * Calcula o XP total ganho com badges
 */
export function getTotalBadgeXP(unlockedIds: string[]): number {
    return getUnlockedBadges(unlockedIds).reduce((sum, badge) => sum + badge.xpReward, 0);
}

/**
 * Retorna estatísticas gerais de badges
 */
export function getBadgeStats(unlockedIds: string[]) {
    const total = BADGES_CONFIG.length;
    const unlocked = unlockedIds.length;

    return {
        total,
        unlocked,
        locked: total - unlocked,
        percentage: Math.round((unlocked / total) * 100),
        totalXPFromBadges: getTotalBadgeXP(unlockedIds),
    };
}
