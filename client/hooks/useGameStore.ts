// ============================================
// DASHFORMANCE - Game Store (Zustand)
// Sprint 03: Superdash Logic RPG
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    ACTION_POINTS,
    COMBO_CONFIG,
    INITIAL_GAME_STATE,
    calculateLevel,
    checkBadges,
    getLevelInfo,
} from '@/lib/gamification';
import type { ActionType, Badge, GameState, UserStats, XPResult } from '@/lib/gamification';

/**
 * Interface das actions do store
 */
interface GameActions {
    // XP Actions
    addXP: (actionType: ActionType, multiplier?: number) => XPResult;
    setXP: (xp: number) => void;
    syncWithProfile: (xp: number, level: number) => void;

    // Combo Actions
    incrementCombo: () => void;
    resetCombo: () => void;
    checkComboDecay: () => void;

    // Stats Actions
    updateStats: (updates: Partial<UserStats>) => void;
    incrementStat: (key: keyof UserStats, amount?: number) => void;

    // Badge Actions
    unlockBadge: (badgeId: string) => void;
    checkAndUnlockBadges: () => Badge[];

    // Login/Streak Actions
    recordLogin: () => void;

    // Reset
    resetGame: () => void;

    // Debug
    getDebugInfo: () => {
        state: GameState;
        levelInfo: ReturnType<typeof getLevelInfo>;
    };
}

type GameStore = GameState & GameActions;

/**
 * Verifica se é um novo dia comparando datas
 */
function isNewDay(lastDate: string | null): boolean {
    if (!lastDate) return true;

    const today = new Date().toISOString().split('T')[0];
    return lastDate !== today;
}

/**
 * Verifica se o streak deve ser mantido (login no dia consecutivo)
 */
function shouldMaintainStreak(lastDate: string | null): boolean {
    if (!lastDate) return false;

    const last = new Date(lastDate);
    const today = new Date();

    // Zera as horas para comparar apenas datas
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    // Streak mantido se for exatamente 1 dia depois
    return diffDays === 1;
}

/**
 * Store Zustand para o sistema de gamificação
 * Persistido no localStorage
 */
export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            // Estado inicial
            ...INITIAL_GAME_STATE,

            /**
             * Adiciona XP ao usuário
             */
            addXP: (actionType: ActionType, extraMultiplier: number = 1): XPResult => {
                const state = get();
                const baseXP = ACTION_POINTS[actionType] || 0;

                // Verifica decay do combo antes de calcular
                get().checkComboDecay();

                const currentCombo = get().combo;
                const totalMultiplier = currentCombo * extraMultiplier;
                const xpGained = Math.floor(baseXP * totalMultiplier);

                const oldXP = state.totalXP;
                const newTotal = oldXP + xpGained;
                const oldLevel = calculateLevel(oldXP);
                const newLevel = calculateLevel(newTotal);
                const leveledUp = newLevel > oldLevel;

                // Atualiza o estado
                set({
                    totalXP: newTotal,
                    level: newLevel,
                    lastActionTimestamp: Date.now(),
                });

                // Incrementa combo após a ação
                get().incrementCombo();

                // Verifica novos badges
                const newBadges = get().checkAndUnlockBadges();

                return {
                    xpGained,
                    baseXP,
                    multiplier: totalMultiplier,
                    newTotal,
                    leveledUp,
                    newLevel,
                    newBadges,
                };
            },

            /**
             * Define o XP diretamente (para debug/admin)
             */
            setXP: (xp: number) => {
                const newLevel = calculateLevel(xp);
                set({ totalXP: xp, level: newLevel });
            },

            /**
             * Sincroniza o estado local com os dados do servidor
             */
            syncWithProfile: (xp: number, level: number) => {
                set({ totalXP: xp, level: level });
            },

            /**
             * Incrementa o multiplicador de combo
             */
            incrementCombo: () => {
                const { combo } = get();
                const newCombo = Math.min(
                    combo + COMBO_CONFIG.incrementPerAction,
                    COMBO_CONFIG.maxMultiplier
                );
                set({ combo: Math.round(newCombo * 10) / 10 }); // 1 casa decimal
            },

            /**
             * Reseta o combo para 1x
             */
            resetCombo: () => {
                set({ combo: 1 });
            },

            /**
             * Verifica se o combo deve decair
             */
            checkComboDecay: () => {
                const { lastActionTimestamp, combo } = get();

                if (!lastActionTimestamp || combo <= 1) return;

                const timeSinceLastAction = Date.now() - lastActionTimestamp;

                if (timeSinceLastAction > COMBO_CONFIG.decayTimeMs) {
                    set({ combo: 1 });
                }
            },

            /**
             * Atualiza estatísticas parcialmente
             */
            updateStats: (updates: Partial<UserStats>) => {
                const { stats } = get();
                set({ stats: { ...stats, ...updates } });
            },

            /**
             * Incrementa uma estatística específica
             */
            incrementStat: (key: keyof UserStats, amount: number = 1) => {
                const { stats } = get();
                set({
                    stats: {
                        ...stats,
                        [key]: (stats[key] as number) + amount,
                    },
                });
            },

            /**
             * Desbloqueia um badge específico
             */
            unlockBadge: (badgeId: string) => {
                const { unlockedBadges } = get();
                if (!unlockedBadges.includes(badgeId)) {
                    set({ unlockedBadges: [...unlockedBadges, badgeId] });
                }
            },

            /**
             * Verifica e desbloqueia badges automaticamente
             */
            checkAndUnlockBadges: (): Badge[] => {
                const { stats, unlockedBadges } = get();
                const newBadges = checkBadges(stats, unlockedBadges);

                if (newBadges.length > 0) {
                    // Desbloqueia os novos badges
                    const newIds = newBadges.map(b => b.id);
                    set({ unlockedBadges: [...unlockedBadges, ...newIds] });

                    // Adiciona XP dos badges (sem multiplicador)
                    const badgeXP = newBadges.reduce((sum, b) => sum + b.xpReward, 0);
                    if (badgeXP > 0) {
                        const { totalXP } = get();
                        const newTotal = totalXP + badgeXP;
                        set({
                            totalXP: newTotal,
                            level: calculateLevel(newTotal),
                        });
                    }
                }

                return newBadges;
            },

            /**
             * Registra login diário e gerencia streaks
             */
            recordLogin: () => {
                const { lastLoginDate, stats } = get();
                const today = new Date().toISOString().split('T')[0];

                // Já logou hoje
                if (lastLoginDate === today) return;

                let newStreak = 1;

                if (shouldMaintainStreak(lastLoginDate)) {
                    // Continua o streak
                    newStreak = stats.currentStreak + 1;
                }

                const newLongestStreak = Math.max(stats.longestStreak, newStreak);

                // Reseta contadores diários
                set({
                    lastLoginDate: today,
                    stats: {
                        ...stats,
                        currentStreak: newStreak,
                        longestStreak: newLongestStreak,
                        totalLoginDays: stats.totalLoginDays + 1,
                        conversionsToday: 0,
                        leadsContactedToday: 0,
                    },
                });

                // Adiciona XP de login diário
                get().addXP('DAILY_LOGIN');

                // Adiciona XP de streak se for maior que 1
                if (newStreak > 1) {
                    const streakBonus = Math.min(newStreak, 7); // Max 7 dias de bônus
                    for (let i = 0; i < streakBonus; i++) {
                        // Não usa addXP para evitar incrementar combo
                        const { totalXP } = get();
                        set({ totalXP: totalXP + ACTION_POINTS.STREAK_BONUS });
                    }
                }

                // Verifica badges de streak
                get().checkAndUnlockBadges();
            },

            /**
             * Reseta todo o progresso do jogo
             */
            resetGame: () => {
                set(INITIAL_GAME_STATE);
            },

            /**
             * Retorna informações para debug
             */
            getDebugInfo: () => {
                const state = get();
                return {
                    state: {
                        totalXP: state.totalXP,
                        level: state.level,
                        combo: state.combo,
                        lastActionTimestamp: state.lastActionTimestamp,
                        unlockedBadges: state.unlockedBadges,
                        stats: state.stats,
                        lastLoginDate: state.lastLoginDate,
                    },
                    levelInfo: getLevelInfo(state.totalXP),
                };
            },
        }),
        {
            name: 'dashformance-game-state',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                totalXP: state.totalXP,
                level: state.level,
                combo: state.combo,
                lastActionTimestamp: state.lastActionTimestamp,
                unlockedBadges: state.unlockedBadges,
                stats: state.stats,
                lastLoginDate: state.lastLoginDate,
            }),
        }
    )
);

// Expor para debug no console (apenas em dev)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as unknown as { __GAME_STORE__: typeof useGameStore })['__GAME_STORE__'] = useGameStore;
}
