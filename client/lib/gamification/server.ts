
import { PrismaClient } from '@prisma/client';
import { ACTION_POINTS, LEVEL_CONFIG } from './config';
import { calculateLevel } from './level';
import { ActionType } from './types';
import prisma from '../prisma'; // Assuming this is where the singleton is

export const GamificationService = {
    /**
     * Add XP to a user and handle level ups
     */
    async addXP(userId: string, action: ActionType, multiplier: number = 1) {
        // 1. Calculate XP Amount
        const baseXP = ACTION_POINTS[action] || 0;
        const xpToAdd = Math.floor(baseXP * multiplier);

        if (xpToAdd === 0) return null;

        try {
            // 2. Fetch current user state
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, xp: true, level: true, gamification: true }
            });

            if (!user) {
                console.warn(`[Gamification] User ${userId} not found`);
                return null;
            }

            // 3. Update XP and Check Level
            const currentXP = user.xp || 0;
            const newXP = currentXP + xpToAdd;
            const newLevel = calculateLevel(newXP);
            const leveledUp = newLevel > (user.level || 1);

            // 4. Update Stats (in gamification JSON)
            const currentStats: any = user.gamification || {};
            // Simple stats update logic could go here, e.g. increment 'actions_count'
            // keeping it simple for now to avoid JSON merging complexity without deep generic handling

            // 5. Persist
            await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: newXP,
                    level: newLevel,
                    // Update gamification stats if we parsed them
                }
            });

            // 6. Log / Notify?
            if (leveledUp) {
                // Create a special interaction or notification?
                // For now, valid for feed consumption
                await prisma.interactions.create({
                    data: {
                        id: crypto.randomUUID(),
                        user_id: userId,
                        type: 'LEVEL_UP',
                        content: `LEVEL_UP:${newLevel}`,
                        updated_at: new Date()
                    }
                }).catch(() => { }); // Ignore errors if needed
            }

            return {
                previousXP: currentXP,
                newXP,
                xpAdded: xpToAdd,
                previousLevel: user.level,
                newLevel,
                leveledUp
            };

        } catch (error) {
            console.error('[Gamification] Error adding XP:', error);
            return null;
        }
    },

    /**
     * Recalculate level for a user based on their absolute XP
     */
    async syncLevel(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true }
        });
        if (!user) return;

        const correctLevel = calculateLevel(user.xp);
        if (correctLevel !== user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: correctLevel }
            });
        }
    }
};
