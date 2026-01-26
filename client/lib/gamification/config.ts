// ============================================
// DASHFORMANCE - RPG Engine Configuration
// Sprint 03: Superdash Logic RPG
// ============================================

import type { ActionType, Badge, ComboConfig, UserStats } from './types';

/**
 * Pontos de XP por tipo de ação
 * Balanceado para incentivar conversões e consistência
 */
/**
 * Pontos de XP por tipo de ação
 * Balanceado conforme solicitado: Venda=200, Reunião=100
 */
export const ACTION_POINTS: Record<ActionType, number> = {
    LEAD_CREATED: 20,        // Aumentado levemente para acompanhar a inflação
    LEAD_CONTACTED: 30,      // Contato inicial
    LEAD_QUALIFIED: 100,     // "Reunião Marcada"
    LEAD_CONVERTED: 200,     // "Venda Fechada"
    TASK_COMPLETED: 30,
    DAILY_LOGIN: 10,
    STREAK_BONUS: 20,
    FIRST_CONVERSION: 100,   // Bônus significativo
    BULK_IMPORT: 5,          // Mantido baixo para evitar spam
};

/**
 * Configuração da fórmula de níveis
 * Fórmula Quadrática: XP necessário = CONSTANTE * (Nível ^ 2)
 */
export const LEVEL_CONFIG = {
    // Ajustado para a nova economia (Inflação de XP):
    // Nível 2: 600 XP (3 Vendas ou 6 Reuniões)
    // Nível 10: 15.000 XP
    // Nível 50: 375.000 XP
    // Nível 100: 1.500.000 XP
    DIFFICULTY_FACTOR: 150,
    MAX_LEVEL: 100,
} as const;

/**
 * Configuração do sistema de combo
 */
export const COMBO_CONFIG: ComboConfig = {
    maxMultiplier: 3,          // Máximo 3x
    decayTimeMs: 5 * 60 * 1000, // Combo decai após 5 minutos sem ação
    incrementPerAction: 0.1,   // +0.1x por ação (até max)
};

/**
 * Nomes e títulos para cada nível (Lúdico mas Sério)
 */
export const LEVEL_TITLES: Record<number, string> = {
    1: 'Iniciado',
    5: 'Explorador',
    10: 'Estrategista',
    20: 'Veterano',
    30: 'Elite',
    40: 'Mestre',
    50: 'Virtuoso',
    60: 'Visionário',
    70: 'Lenda',
    85: 'Titã',
    100: 'Imortal',
};

/**
 * Retorna o título para um nível específico
 */
export function getLevelTitle(level: number): string {
    const levels = Object.keys(LEVEL_TITLES)
        .map(Number)
        .sort((a, b) => b - a);

    for (const lvl of levels) {
        if (level >= lvl) {
            return LEVEL_TITLES[lvl];
        }
    }
    return LEVEL_TITLES[1];
}

/**
 * Configuração de todos os badges do sistema
 */
export const BADGES_CONFIG: Badge[] = [
    // === LEADS ===
    {
        id: 'first_lead',
        name: 'Primeiro Passo',
        description: 'Crie seu primeiro lead',
        icon: 'UserPlus',
        tier: 'bronze',
        category: 'leads',
        requirement: (stats: UserStats) => stats.totalLeadsCreated >= 1,
        xpReward: 50,
    },
    {
        id: 'lead_hunter',
        name: 'Caçador de Leads',
        description: 'Crie 50 leads',
        icon: 'Target',
        tier: 'silver',
        category: 'leads',
        requirement: (stats: UserStats) => stats.totalLeadsCreated >= 50,
        xpReward: 200,
    },
    {
        id: 'lead_master',
        name: 'Mestre dos Leads',
        description: 'Crie 500 leads',
        icon: 'Crown',
        tier: 'gold',
        category: 'leads',
        requirement: (stats: UserStats) => stats.totalLeadsCreated >= 500,
        xpReward: 1000,
    },
    {
        id: 'lead_legend',
        name: 'Lenda do Pipeline',
        description: 'Crie 2000 leads',
        icon: 'Flame',
        tier: 'platinum',
        category: 'leads',
        requirement: (stats: UserStats) => stats.totalLeadsCreated >= 2000,
        xpReward: 5000,
    },

    // === CONVERSÕES ===
    {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Converta seu primeiro lead',
        icon: 'Trophy',
        tier: 'bronze',
        category: 'conversion',
        requirement: (stats: UserStats) => stats.totalLeadsConverted >= 1,
        xpReward: 100,
    },
    {
        id: 'closer',
        name: 'Closer',
        description: 'Converta 10 leads',
        icon: 'Handshake',
        tier: 'silver',
        category: 'conversion',
        requirement: (stats: UserStats) => stats.totalLeadsConverted >= 10,
        xpReward: 500,
    },
    {
        id: 'deal_maker',
        name: 'Deal Maker',
        description: 'Converta 50 leads',
        icon: 'BadgeDollarSign',
        tier: 'gold',
        category: 'conversion',
        requirement: (stats: UserStats) => stats.totalLeadsConverted >= 50,
        xpReward: 2000,
    },
    {
        id: 'sales_machine',
        name: 'Máquina de Vendas',
        description: 'Converta 200 leads',
        icon: 'Zap',
        tier: 'platinum',
        category: 'conversion',
        requirement: (stats: UserStats) => stats.totalLeadsConverted >= 200,
        xpReward: 10000,
    },

    // === STREAKS ===
    {
        id: 'consistent',
        name: 'Consistência',
        description: '7 dias consecutivos de login',
        icon: 'Calendar',
        tier: 'bronze',
        category: 'streak',
        requirement: (stats: UserStats) => stats.currentStreak >= 7,
        xpReward: 150,
    },
    {
        id: 'dedicated',
        name: 'Dedicação',
        description: '30 dias consecutivos de login',
        icon: 'CalendarCheck',
        tier: 'silver',
        category: 'streak',
        requirement: (stats: UserStats) => stats.currentStreak >= 30,
        xpReward: 500,
    },
    {
        id: 'unstoppable',
        name: 'Imparável',
        description: '90 dias consecutivos de login',
        icon: 'Rocket',
        tier: 'gold',
        category: 'streak',
        requirement: (stats: UserStats) => stats.currentStreak >= 90,
        xpReward: 2000,
    },

    // === MILESTONES ===
    {
        id: 'qualifier',
        name: 'Qualificador',
        description: 'Qualifique 25 leads',
        icon: 'CheckCircle',
        tier: 'silver',
        category: 'milestone',
        requirement: (stats: UserStats) => stats.totalLeadsQualified >= 25,
        xpReward: 300,
    },
    {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 100 tarefas',
        icon: 'ListChecks',
        tier: 'gold',
        category: 'milestone',
        requirement: (stats: UserStats) => stats.totalTasksCompleted >= 100,
        xpReward: 1000,
    },
    {
        id: 'daily_warrior',
        name: 'Guerreiro Diário',
        description: 'Faça 10 contatos em um único dia',
        icon: 'Phone',
        tier: 'silver',
        category: 'milestone',
        requirement: (stats: UserStats) => stats.leadsContactedToday >= 10,
        xpReward: 200,
    },
];

/**
 * Estado inicial do jogo
 */
export const INITIAL_GAME_STATE = {
    totalXP: 0,
    level: 1,
    combo: 1,
    lastActionTimestamp: null,
    unlockedBadges: [],
    stats: {
        totalLeadsCreated: 0,
        totalLeadsConverted: 0,
        totalLeadsQualified: 0,
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalLoginDays: 0,
        conversionsToday: 0,
        leadsContactedToday: 0,
    },
    lastLoginDate: null,
};
