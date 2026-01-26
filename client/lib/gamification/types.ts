// ============================================
// DASHFORMANCE - RPG Engine Types
// Sprint 03: Superdash Logic RPG
// ============================================

/**
 * Tipos de ações que geram XP no sistema
 */
export type ActionType =
    | 'LEAD_CREATED'       // Lead criado/importado
    | 'LEAD_QUALIFIED'     // Lead qualificado (movido para próxima fase)
    | 'LEAD_CONVERTED'     // Lead convertido em cliente
    | 'LEAD_CONTACTED'     // Lead contatado
    | 'TASK_COMPLETED'     // Tarefa completada
    | 'DAILY_LOGIN'        // Login diário
    | 'STREAK_BONUS'       // Bônus por sequência de dias
    | 'FIRST_CONVERSION'   // Primeira conversão do dia
    | 'BULK_IMPORT';       // Importação em massa

/**
 * Estatísticas do usuário para validação de badges
 */
export interface UserStats {
    totalLeadsCreated: number;
    totalLeadsConverted: number;
    totalLeadsQualified: number;
    totalTasksCompleted: number;
    currentStreak: number;        // Dias consecutivos de login
    longestStreak: number;        // Maior sequência de dias
    totalLoginDays: number;       // Total de dias logado
    conversionsToday: number;     // Conversões hoje
    leadsContactedToday: number;  // Leads contatados hoje
}

/**
 * Definição de um badge/conquista
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;                 // Nome do ícone Lucide
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    category: 'leads' | 'conversion' | 'streak' | 'milestone';
    requirement: (stats: UserStats) => boolean;
    xpReward: number;            // XP ganho ao desbloquear
}

/**
 * Informações de nível do jogador
 */
export interface LevelInfo {
    level: number;
    currentXP: number;
    xpForCurrentLevel: number;   // XP necessário para atingir o nível atual
    xpForNextLevel: number;      // XP necessário para o próximo nível
    progress: number;            // Progresso 0-100 para o próximo nível
    xpToNextLevel: number;       // XP faltando para o próximo nível
}

/**
 * Estado do jogo persistido
 */
export interface GameState {
    // XP e Nível
    totalXP: number;
    level: number;

    // Combo/Multiplicador
    combo: number;
    lastActionTimestamp: number | null;

    // Badges
    unlockedBadges: string[];    // IDs dos badges desbloqueados

    // Estatísticas
    stats: UserStats;

    // Histórico
    lastLoginDate: string | null; // ISO date string
}

/**
 * Resultado de uma ação de XP
 */
export interface XPResult {
    xpGained: number;
    baseXP: number;
    multiplier: number;
    newTotal: number;
    leveledUp: boolean;
    newLevel: number;
    newBadges: Badge[];
}

/**
 * Configuração de combo
 */
export interface ComboConfig {
    maxMultiplier: number;       // Máximo multiplicador (ex: 3x)
    decayTimeMs: number;         // Tempo para o combo decair (ms)
    incrementPerAction: number;  // Quanto o combo aumenta por ação
}
