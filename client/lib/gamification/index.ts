// ============================================
// DASHFORMANCE - Gamification Module
// Sprint 03: Superdash Logic RPG
// ============================================

// Types
export type {
    ActionType,
    Badge,
    ComboConfig,
    GameState,
    LevelInfo,
    UserStats,
    XPResult,
} from './types';

// Config
export {
    ACTION_POINTS,
    BADGES_CONFIG,
    COMBO_CONFIG,
    INITIAL_GAME_STATE,
    LEVEL_CONFIG,
    LEVEL_TITLES,
    getLevelTitle,
} from './config';

// Level System
export {
    calculateLevel,
    checkLevelUp,
    getLevelInfo,
    getLevelSummary,
    getXPForLevel,
    getXPTable,
} from './level';

// Badges System
export {
    checkBadges,
    getBadgesByCategory,
    getBadgeStats,
    getLockedBadges,
    getNextBadges,
    getTotalBadgeXP,
    getUnlockedBadges,
} from './badges';
