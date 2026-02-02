import prisma from '../prisma';
import { LeadSanitizer } from './lead-sanitizer';
import { GamificationService } from '../gamification/server';
import { ACTION_POINTS } from '../gamification/config';
import { AnalyticsService } from './analytics-service';
import crypto from 'crypto';

// Helper function for score calculation moved to AnalyticsService
function calculateScore(lead: any): number {
    return AnalyticsService.calculateScore(lead);
}

export const LeadsService = {
    async getDashboardUsers() {
        return AnalyticsService.getDashboardUsers();
    },

    async create(data: any) {
        // Extract contacts before sanitization (as sanitizer strips unknown fields)
        const { contacts, ...leadData } = data;

        // Use strict sanitizer
        const sanitized = LeadSanitizer.sanitizeForCreate(leadData);

        // Handle missing CNPJ for manual leads
        if (!sanitized.cnpj || sanitized.cnpj.trim() === '') {
            sanitized.cnpj = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        const currentId = sanitized.id || (globalThis.crypto?.randomUUID?.() || crypto.randomUUID());

        const createData: any = {
            ...sanitized,
            id: currentId,
            owner_id: data.owner_id || undefined, // Explicitly pass owner_id
            updated_at: new Date(),
        };

        // Handle nested contacts creation
        if (Array.isArray(contacts) && contacts.length > 0) {
            createData.contacts = {
                create: contacts.map((contact: any) => {
                    const { id, lead_id, ...contactFields } = contact;
                    return {
                        ...contactFields,
                        id: (globalThis.crypto?.randomUUID?.() || crypto.randomUUID()),
                        updated_at: new Date()
                    };
                })
            };
        }

        const lead = await prisma.leads.create({
            data: createData,
        });

        // Log creation as interaction for the feed
        await prisma.interactions.create({
            data: {
                id: (globalThis.crypto?.randomUUID?.() || crypto.randomUUID()),
                lead_id: lead.id,
                type: 'CREATE',
                content: 'Lead criado manualmente',
                user_id: lead.owner_id || data.owner || 'system',
                updated_at: new Date()
            }
        });

        // XP Reward
        if (lead.owner_id) {
            await GamificationService.addXP(lead.owner_id, 'LEAD_CREATED');
        }

        return lead;
    },

    async createMany(leads: any[], userId?: string) {
        const ops = leads.map((lead: any) => {
            const data = {
                ...lead,
                owner_id: lead.owner_id || userId,
                deletedAt: null
            };
            return prisma.leads.upsert({
                where: { cnpj: lead.cnpj },
                create: data as any,
                update: data as any,
            });
        });

        const results = await prisma.$transaction(ops);

        // Log import as a single interaction for the feed
        if (results.length > 0) {
            await prisma.interactions.create({
                data: {
                    id: crypto.randomUUID(),
                    lead_id: results[0].id, // Link to first lead in batch
                    type: 'IMPORT',
                    content: `IMPORT:${results.length}`,
                    user_id: userId || 'system',
                    updated_at: new Date()
                }
            });
        }

        // XP Reward
        if (userId && results.length > 0) {
            // 5 XP per batch (as per config) * multiplier? 
            // Or per lead?
            // Let's assume Config logic handles it, or use count.
            // Server.addXP takes 'BULK_IMPORT', which is 5. 
            // If we want 5 * count, we pass count as multiplier.
            await GamificationService.addXP(userId, 'BULK_IMPORT', results.length);
        }

        return { count: results.length };
    },

    async findAll(page = 1, limit = 50, filters?: {
        search?: string;
        status?: string[];
        owner?: string;
        ownerId?: string; // Authenticated User ID
        source?: string[];
        city?: string;
        scoreMin?: number;
        scoreMax?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        console.log(`[LeadsService] findAll called with page=${page}, limit=${limit}, filters=`, filters);
        const skip = (page - 1) * limit;

        // Use AND array for safe filter composition
        const AND: any[] = [{ deletedAt: null }];

        if (filters?.ownerId) {
            AND.push({ owner_id: filters.ownerId });
        } else if (filters?.owner && filters.owner !== 'all') {
            // Legacy support
            AND.push({ owner: filters.owner });
        }

        if (filters?.status && filters.status.length > 0) {
            AND.push({ status: { in: filters.status } });
        }

        if (filters?.source && filters.source.length > 0) {
            AND.push({ source: { in: filters.source } });
        }

        if (filters?.city) {
            AND.push({ city: { contains: filters.city, mode: 'insensitive' } });
        }

        if (filters?.scoreMin !== undefined) {
            AND.push({ score: { gte: filters.scoreMin } });
        }

        if (filters?.scoreMax !== undefined) {
            AND.push({ score: { lte: filters.scoreMax } });
        }

        if (filters?.search) {
            AND.push({
                OR: [
                    { company_name: { contains: filters.search, mode: 'insensitive' } },
                    { trade_name: { contains: filters.search, mode: 'insensitive' } },
                    { cnpj: { contains: filters.search } },
                    { decision_maker: { contains: filters.search, mode: 'insensitive' } },
                    { city: { contains: filters.search, mode: 'insensitive' } },
                    { phone: { contains: filters.search } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    {
                        contacts: {
                            some: {
                                OR: [
                                    { name: { contains: filters.search, mode: 'insensitive' } },
                                    { phone: { contains: filters.search } },
                                    { whatsapp: { contains: filters.search } },
                                    { email: { contains: filters.search, mode: 'insensitive' } },
                                ]
                            }
                        }
                    }
                ]
            });
        }

        const where = { AND };

        // Sorting Logic
        const orderBy: any = {};
        if (filters?.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder || 'desc';
        } else {
            orderBy.date_added = 'desc';
        }

        try {
            console.log('[LeadsService] Executing Prisma queries...');

            // Execute main leads and total count first
            const [leads, total] = await Promise.all([
                prisma.leads.findMany({
                    skip,
                    take: Number(limit),
                    where,
                    orderBy,
                    include: { contacts: { where: { is_primary: true } } }
                }),
                prisma.leads.count({ where }),
            ]);

            console.log(`[LeadsService] Queries success. Found ${leads.length} leads.`);
            return {
                data: leads,
                meta: {
                    total,
                    page: Number(page),
                    last_page: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('[LeadsService] findAll Error:', error);
            throw error;
        }
    },

    async findOne(id: string) {
        return prisma.leads.findUnique({
            where: { id },
            include: {
                Segment: true,
                contacts: {
                    orderBy: [
                        { is_primary: 'desc' },
                        { created_at: 'asc' }
                    ]
                }
            }
        });
    },

    async remove(id: string) {
        return prisma.leads.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },

    async removeMany(ids: string[]) {
        return prisma.leads.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        });
    },

    /**
     * Merges a source lead into a target lead.
     * Transfers interactions and contacts, then soft-deletes the source.
     */
    async mergeLeads(targetId: string, sourceId: string) {
        console.log(`[LeadsService] Merging lead ${sourceId} into ${targetId}`);

        // 1. Fetch both leads
        const [target, source] = await Promise.all([
            prisma.leads.findUnique({ where: { id: targetId } }),
            prisma.leads.findUnique({ where: { id: sourceId } })
        ]);

        if (!target || !source) return;

        // 2. Transfer Interactions
        await prisma.interactions.updateMany({
            where: { lead_id: sourceId },
            data: { lead_id: targetId }
        });

        // 3. Transfer Contacts (only if source has contacts and target doesn't or etc.)
        // For simplicity, let's just move all contacts to the target lead
        await prisma.contacts.updateMany({
            where: { lead_id: sourceId },
            data: { lead_id: targetId }
        });

        // 4. Update Target metadata if source has more info
        const updateData: any = {};
        if (!target.owner_id && source.owner_id) {
            updateData.owner_id = source.owner_id;
            updateData.owner = source.owner;
        }

        // Merge extra_info (qualifications, etc.)
        const targetExtra = (target.extra_info as any) || {};
        const sourceExtra = (source.extra_info as any) || {};
        updateData.extra_info = { ...sourceExtra, ...targetExtra };

        if (Object.keys(updateData).length > 0) {
            await prisma.leads.update({
                where: { id: targetId },
                data: updateData
            });
        }

        // 5. Soft Delete Source
        await prisma.leads.update({
            where: { id: sourceId },
            data: { deletedAt: new Date() }
        });
    },

    async restore(id: string) {
        return prisma.leads.update({
            where: { id },
            data: { deletedAt: null }
        });
    },

    async restoreMany(ids: string[]) {
        return prisma.leads.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null }
        });
    },

    async hardDelete(id: string) {
        return prisma.leads.delete({
            where: { id }
        });
    },

    async findAllTrashed() {
        return prisma.leads.findMany({
            where: { NOT: { deletedAt: null } },
            orderBy: { deletedAt: 'desc' }
        });
    },

    async updateMany(ids: string[], updateData: any) {
        return prisma.leads.updateMany({
            where: { id: { in: ids } },
            data: updateData,
        });
    },

    async disqualify(id: string) {
        return prisma.leads.update({
            where: { id },
            data: { status: 'DISQUALIFIED' }
        });
    },

    // Expose calculateScore if needed elsewhere, referencing the helper
    calculateScore,

    async update(id: string, data: any) {
        // Use strict sanitizer for update
        const sanitizedData = LeadSanitizer.sanitizeForUpdate(data);

        // Capture performing user for attribution logs (do NOT pass to Prisma leads.update)
        const performingUserId = data.userId;

        // Defensive check: if no fields are left after sanitization, skip DB call
        if (Object.keys(sanitizedData).length === 0) {
            console.warn(`[LeadsService] Update called for ${id} but no valid fields were provided.`);
            return prisma.leads.findUnique({ where: { id } });
        }

        // Always fetch current lead for status change tracking and ownership protection
        const currentLead = await prisma.leads.findUnique({
            where: { id },
            select: { extra_info: true, website_url: true, instagram_url: true, render_quality: true, status: true, owner: true, owner_id: true }
        });

        if (!currentLead) return null;

        // --- OWNERSHIP PROTECTION GUARD ---
        // If owner_id is missing in update but present in current, preserve it (prevent accidental clearing)
        if (currentLead.owner_id && !sanitizedData.owner_id && sanitizedData.owner_id !== null) {
            sanitizedData.owner_id = currentLead.owner_id;
        }

        // Sync owner name label if owner_id changed
        if (sanitizedData.owner_id && sanitizedData.owner_id !== currentLead.owner_id) {
            const newOwner = await prisma.user.findUnique({ where: { id: sanitizedData.owner_id } });
            if (newOwner) {
                sanitizedData.owner = newOwner.name.split(' ')[0].toLowerCase();
            }
        }
        // ----------------------------------

        // Merge data for accurate score calculation if relevant fields are being updated
        if (currentLead && (data.extra_info || data.website_url || data.instagram_url || data.render_quality)) {
            const mergedExtraInfo = {
                ...(currentLead.extra_info as object || {}),
                ...(sanitizedData.extra_info as object || {})
            };
            const mergedLeadData = {
                ...currentLead,
                ...sanitizedData,
                extra_info: mergedExtraInfo
            };
            sanitizedData.score = calculateScore(mergedLeadData);
        }

        // Log status change as interaction
        if (currentLead && sanitizedData.status && currentLead.status !== sanitizedData.status) {
            await prisma.interactions.create({
                data: {
                    id: crypto.randomUUID(),
                    lead_id: id,
                    type: 'STATUS_CHANGE',
                    content: `MOVETO:${sanitizedData.status}`, // Machine readable format
                    user_id: performingUserId || sanitizedData.owner_id || currentLead.owner_id || 'system',
                    updated_at: new Date()
                }
            });
        }

        const updatedLead = await prisma.leads.update({
            where: { id },
            data: sanitizedData,
        });

        // XP Triggers based on status change
        if (currentLead && sanitizedData.status && currentLead.status !== sanitizedData.status) {
            const userToReward = sanitizedData.owner_id || currentLead.owner_id;

            if (userToReward) {
                const newStatus = sanitizedData.status;
                const leadScore = updatedLead.score || 0;

                // --- RPG ARENA MULTIPLIERS (Sprint 12) ---
                let multiplier = 1;
                if (leadScore >= 90) multiplier = 1.5;      // LEGENDARY
                else if (leadScore >= 75) multiplier = 1.3; // DIAMOND
                else if (leadScore >= 60) multiplier = 1.1; // GOLD

                // Dynamic Mapping based reward
                const mapping = await AnalyticsService.getStepMapping();
                const m = mapping[newStatus] || { step: 0, isWin: false, isLost: false };

                if (m.isWin) {
                    // Conversion Bonus: 200 base + 1 XP for every R$ 500 in contract_value
                    const revenueBonus = Math.floor((Number(updatedLead.contract_value) || 0) / 500);
                    const totalMultiplier = multiplier + (revenueBonus / 100);
                    await GamificationService.addXP(userToReward, 'LEAD_CONVERTED', totalMultiplier);
                } else if (m.step === 4 || newStatus === 'MEETING') { // Still keeping Meeting as a landmark
                    await GamificationService.addXP(userToReward, 'LEAD_QUALIFIED', multiplier);
                } else if (m.step === 2 || newStatus === 'CONTACTED') {
                    await GamificationService.addXP(userToReward, 'LEAD_CONTACTED', multiplier);
                } else if (m.step > 0) {
                    await GamificationService.addXP(userToReward, 'TASK_COMPLETED', multiplier);
                }
            }
        }

        return updatedLead;
    }
    ,

    async cleanupDuplicates() {
        const allLeads = await prisma.leads.findMany({
            where: { deletedAt: null },
            orderBy: { date_added: 'asc' }
        });

        const mergeJobs: { targetId: string, sourceId: string }[] = [];
        const processedIds = new Set<string>();

        const checkDuplicates = (keyFn: (l: any) => string | null) => {
            const groups = new Map<string, any[]>();
            for (const lead of allLeads) {
                if (processedIds.has(lead.id)) continue;
                const key = keyFn(lead);
                if (!key) continue;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(lead);
            }

            for (const [key, group] of groups) {
                if (group.length > 1) {
                    // Decide which one to keep
                    const withUserNotes = group.filter(l => {
                        if (!l.notes || l.notes.trim().length === 0) return false;
                        const note = l.notes.toLowerCase().trim();
                        if (note.startsWith('deep discovery')) return false;
                        return true;
                    });

                    let targetLead: any;
                    if (withUserNotes.length > 0) {
                        // Prioritize lead with user notes
                        targetLead = withUserNotes[0];
                    } else {
                        // Prioritize lead with owner
                        const withOwner = group.filter(l => l.owner_id);
                        if (withOwner.length > 0) {
                            targetLead = withOwner[0];
                        } else {
                            // Prioritize by score
                            const scored = group.map(l => ({
                                lead: l,
                                score: (l.email && l.email.trim().length > 5 ? 1 : 0) +
                                    (l.phone && l.phone.replace(/[^0-9]/g, '').length >= 8 ? 1 : 0)
                            }));
                            const maxScore = Math.max(...scored.map(s => s.score));
                            targetLead = scored.find(s => s.score === maxScore)!.lead;
                        }
                    }

                    processedIds.add(targetLead.id);
                    for (const lead of group) {
                        if (lead.id !== targetLead.id && !processedIds.has(lead.id)) {
                            mergeJobs.push({ targetId: targetLead.id, sourceId: lead.id });
                            processedIds.add(lead.id);
                        }
                    }
                }
            }
        };

        checkDuplicates((l: any) => (l.email && l.email.trim().length > 5) ? l.email.toLowerCase().trim() : null);
        checkDuplicates((l: any) => {
            if (!l.phone) return null;
            const p = l.phone.replace(/[^0-9]/g, '');
            if (p.length < 8) return null;
            return p;
        });

        if (mergeJobs.length > 0) {
            console.log(`[LeadsService] Starting merge of ${mergeJobs.length} duplicate pairs`);
            for (const job of mergeJobs) {
                await this.mergeLeads(job.targetId, job.sourceId);
            }
            return { mergedCount: mergeJobs.length, ids: mergeJobs.map(j => j.sourceId) };
        }
        return { mergedCount: 0, ids: [] };
    },


    // Analytical methods moved to AnalyticsService
    getStatsOverview: (...args: any[]) => (AnalyticsService as any).getStatsOverview(...args),
    getUpcomingMeetings: (...args: any[]) => (AnalyticsService as any).getUpcomingMeetings(...args),
    getConversionFunnel: (...args: any[]) => (AnalyticsService as any).getConversionFunnel(...args),
    getTimelineStats: (...args: any[]) => (AnalyticsService as any).getTimelineStats(...args),
    getPerformanceByOwner: (...args: any[]) => (AnalyticsService as any).getPerformanceByOwner(...args),
    getLeadsByState: (...args: any[]) => (AnalyticsService as any).getLeadsByState(...args),
    getSalesForce: (...args: any[]) => (AnalyticsService as any).getSalesForce(...args),
    getRecentActivity: (...args: any[]) => (AnalyticsService as any).getRecentActivity(...args),
    getHourlyActivity: (ownerId?: string) => AnalyticsService.getActivityTrend(new Date(Date.now() - 23 * 60 * 60 * 1000), new Date(), ownerId),
    getActivityTrend: (...args: any[]) => (AnalyticsService as any).getActivityTrend(...args),

    async deduplicate() {
        console.log('🔄 Starting Lead Deduplication (Smart Merge)...');

        // 1. Find potential duplicates (by email first)
        const leadsWithEmails = await prisma.leads.findMany({
            where: {
                deletedAt: null,
                email: { not: null, notIn: [''] }
            },
            select: { id: true, email: true, company_name: true, date_added: true }
        });

        const groups = new Map<string, string[]>();
        leadsWithEmails.forEach(l => {
            const key = l.email?.toLowerCase().trim();
            if (key) {
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(l.id);
            }
        });

        let totalMerged = 0;

        for (const [email, ids] of groups.entries()) {
            if (ids.length < 2) continue;

            console.log(`Merging ${ids.length} leads for email: ${email}`);

            // Find the Master Lead: The one with most interactions or the oldest
            const candidates = await prisma.leads.findMany({
                where: { id: { in: ids } },
                include: {
                    _count: {
                        select: { interactions: true }
                    }
                },
                orderBy: [
                    { interactions: { _count: 'desc' } },
                    { date_added: 'asc' }
                ]
            });

            const master = candidates[0];
            const duplicates = candidates.slice(1);

            for (const dup of duplicates) {
                // 1. Transfer Interactions
                await prisma.interactions.updateMany({
                    where: { lead_id: dup.id },
                    data: { lead_id: master.id }
                });

                // 2. Transfer Contacts
                await prisma.contacts.updateMany({
                    where: { lead_id: dup.id },
                    data: { lead_id: master.id }
                });

                // 3. Update Master fields if null
                const updateData: any = {};
                const fieldsToMerge: (keyof typeof master)[] = [
                    'phone', 'website_url', 'cnpj', 'company_name', 'trade_name',
                    'extra_info', 'uf', 'city', 'source',
                    'instagram_url', 'decision_maker'
                ];

                fieldsToMerge.forEach(field => {
                    if (!master[field] && dup[field]) {
                        updateData[field] = dup[field];
                    }
                });

                if (Object.keys(updateData).length > 0) {
                    await prisma.leads.update({
                        where: { id: master.id },
                        data: updateData
                    });
                }

                // 4. Soft Delete
                await prisma.leads.update({
                    where: { id: dup.id },
                    data: { deletedAt: new Date() }
                });

                totalMerged++;
            }
        }

        console.log(`✅ Deduplication complete. Merged ${totalMerged} leads.`);
        return { totalMerged };
    },

    // Analytical methods moved to AnalyticsService
};
