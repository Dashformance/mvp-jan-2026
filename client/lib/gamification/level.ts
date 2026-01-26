// ============================================
// DASHFORMANCE - Level Calculator
// Sprint 03: Superdash Logic RPG
// ============================================

import { LEVEL_CONFIG, getLevelTitle } from './config';
import type { LevelInfo } from './types';

/**
 * Calcula o XP necessário para atingir um determinado nível
 * Fórmula Quadrática: DIFFICULTY_FACTOR * (level ^ 2)
 * 
 * @param level - Nível desejado (1-based)
 * @returns XP total necessário para atingir esse nível
 */
export function getXPForLevel(level: number): number {
    if (level <= 1) return 0;

    const { DIFFICULTY_FACTOR, MAX_LEVEL } = LEVEL_CONFIG;
    const clampedLevel = Math.min(level, MAX_LEVEL);

    // Fórmula quadrática simples: XP = K * L^2
    // Isso cria uma curva onde os níveis iniciais são fáceis e
    // os finais exigem progressivamente mais esforço, sem explodir exponencialmente.
    return Math.floor(DIFFICULTY_FACTOR * Math.pow(clampedLevel, 2));
}

/**
 * Calcula o nível baseado no XP total
 * 
 * @param xp - XP total do usuário
 * @returns Nível atual
 */
export function calculateLevel(xp: number): number {
    if (xp <= 0) return 1;

    const { MAX_LEVEL } = LEVEL_CONFIG;
    let level = 1;

    while (level < MAX_LEVEL && xp >= getXPForLevel(level + 1)) {
        level++;
    }

    return level;
}

/**
 * Retorna informações completas sobre o nível do jogador
 * 
 * @param xp - XP total do usuário
 * @returns Objeto com todas as informações de nível
 */
export function getLevelInfo(xp: number): LevelInfo {
    const level = calculateLevel(xp);
    const xpForCurrentLevel = getXPForLevel(level);
    const xpForNextLevel = getXPForLevel(level + 1);

    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

    const progress = xpNeededForNextLevel > 0
        ? Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100)
        : 100;

    const xpToNextLevel = Math.max(0, xpForNextLevel - xp);

    return {
        level,
        currentXP: xp,
        xpForCurrentLevel,
        xpForNextLevel,
        progress: Math.round(progress * 10) / 10, // 1 casa decimal
        xpToNextLevel,
    };
}

/**
 * Retorna um resumo formatado do nível
 */
export function getLevelSummary(xp: number): string {
    const info = getLevelInfo(xp);
    const title = getLevelTitle(info.level);

    return `Nível ${info.level} - ${title} (${info.progress}% para o próximo)`;
}

/**
 * Verifica se houve level up entre dois valores de XP
 */
export function checkLevelUp(oldXP: number, newXP: number): boolean {
    return calculateLevel(newXP) > calculateLevel(oldXP);
}

/**
 * Retorna a tabela de XP por nível (para debug/UI)
 */
export function getXPTable(maxLevel: number = 20): Array<{ level: number; xpRequired: number; xpTotal: number; title: string }> {
    const table = [];

    for (let level = 1; level <= maxLevel; level++) {
        const xpTotal = getXPForLevel(level);
        const xpRequired = level > 1 ? xpTotal - getXPForLevel(level - 1) : 0;

        table.push({
            level,
            xpRequired,
            xpTotal,
            title: getLevelTitle(level),
        });
    }

    return table;
}
