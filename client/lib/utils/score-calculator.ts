
import type { CardTier, PlayerStats } from '@/components/super-dash/PlayerCard';

// ===== METAS PADRÃO =====
export interface PerformanceMeta {
    leads: number;
    respostas: number;
    reunioes: number;
    vendas: number;
    conversao: number;
    xpDia: number;
}

export const DEFAULT_META: PerformanceMeta = {
    leads: 100,
    respostas: 50,
    reunioes: 20,
    vendas: 10,
    conversao: 10, // 10%
    xpDia: 200,
};

// ===== PESOS PARA CÁLCULO =====
const WEIGHTS = {
    leads: 0.15,
    respostas: 0.15,
    reunioes: 0.20,
    vendas: 0.30,
    conversao: 0.20,
};

// ===== CALCULAR SCORE (0-99) =====
export function calculateScore(
    stats: Omit<PlayerStats, 'xpDia'>,
    meta: PerformanceMeta = DEFAULT_META
): number {
    const scores = {
        leads: Math.min((stats.leads / meta.leads) * 100, 100),
        respostas: Math.min((stats.respostas / meta.respostas) * 100, 100),
        reunioes: Math.min((stats.reunioes / meta.reunioes) * 100, 100),
        vendas: Math.min((stats.vendas / meta.vendas) * 100, 100),
        conversao: Math.min((stats.conversao / meta.conversao) * 100, 100),
    };

    const weighted = Object.keys(WEIGHTS).reduce((sum, key) => {
        return sum + (scores[key as keyof typeof scores] * WEIGHTS[key as keyof typeof WEIGHTS]);
    }, 0);

    // Normalizar para 0-99
    return Math.min(Math.round(weighted * 0.99), 99);
}

// ===== DETERMINAR TIER =====
export function getTier(
    score: number,
    ranking: number,
    totalPlayers: number
): CardTier {
    const percentile = (ranking / totalPlayers) * 100;

    // Strict performance-based tiers
    if (score >= 90 || (ranking === 1 && totalPlayers > 1)) {
        return 'gold';
    } else if (score >= 80 || percentile <= 20) {
        return 'diamond';
    } else if (score >= 70 || percentile <= 40) {
        return 'platinum';
    } else if (score >= 50 || percentile <= 70) {
        return 'emerald';
    } else {
        return 'bronze';
    }
}

// ===== SELECIONAR BADGE =====
export function getBadge(
    score: number,
    ranking: number,
    streak?: number
): string {
    if (ranking === 1) return '👑';
    if (ranking <= 3) return '🏆';
    if (streak && streak >= 5) return '🔥';
    if (score >= 90) return '⭐';
    if (score >= 80) return '💎';
    return '⚡';
}

// ===== CALCULAR XP DIÁRIO =====
export function calculateDailyXP(stats: Omit<PlayerStats, 'xpDia'>): number {
    const XP_VALUES = {
        lead: 10,
        resposta: 15,
        reuniao: 50,
        venda: 200,
    };

    return (
        stats.leads * XP_VALUES.lead +
        stats.respostas * XP_VALUES.resposta +
        stats.reunioes * XP_VALUES.reuniao +
        stats.vendas * XP_VALUES.venda
    );
}

// ===== HELPER COMPLETO =====
export function generatePlayerCard(
    stats: Omit<PlayerStats, 'xpDia' | 'conversao'>,
    ranking: number,
    totalPlayers: number,
    streak?: number,
    meta?: PerformanceMeta
) {
    const conversao = stats.leads > 0
        ? Math.round((stats.vendas / stats.leads) * 100)
        : 0;

    const fullStats: Omit<PlayerStats, 'xpDia'> = {
        ...stats,
        conversao,
    };

    const score = calculateScore(fullStats, meta);
    const tier = getTier(score, ranking, totalPlayers);
    const badge = getBadge(score, ranking, streak);
    const xpDia = calculateDailyXP(fullStats);

    return {
        score,
        tier,
        badge,
        stats: {
            ...fullStats,
            xpDia,
        },
    };
}

// ===== DETERMINAR EDITION LABEL =====
export function getEditionLabel(ranking: number, score: number): string {
    if (ranking === 1) return 'MVP do Mês';
    if (ranking <= 3) return 'Top Seller';
    if (score >= 90) return 'Elite Player';
    if (score >= 80) return 'High Performer';
    if (score >= 70) return 'Solid Player';
    if (score >= 50) return 'Rising Star';
    return 'Rookie';
}

// ===== DETERMINAR ROLE LABEL =====
export function getRoleAbbreviation(role: string): 'SDR' | 'CLO' | 'JR' | 'MGR' | 'CEO' {
    const roleMap: Record<string, 'SDR' | 'CLO' | 'JR' | 'MGR' | 'CEO'> = {
        'SDR Senior': 'SDR',
        'SDR Junior': 'JR',
        'SDR': 'SDR',
        'Closer': 'CLO',
        'Manager': 'MGR',
        'Gerente': 'MGR',
        'CEO': 'CEO',
        'Diretor': 'CEO',
        'Head': 'CEO',
    };

    return roleMap[role] || 'SDR';
}
