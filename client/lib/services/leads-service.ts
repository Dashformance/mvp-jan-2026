import prisma from '../prisma';
import { LeadSanitizer } from './lead-sanitizer';
import { GamificationService } from '../gamification/server';
import { ACTION_POINTS } from '../gamification/config';
import crypto from 'crypto';

// Helper function for score calculation (kept internal or exported if needed)
function calculateScore(lead: any): number {
    let score = 0;
    // Basic Info
    if (lead.email && lead.email.trim().length > 5) score += 10;
    if (lead.phone && lead.phone.replace(/[^0-9]/g, '').length >= 8) score += 10;
    if (lead.decision_maker) score += 10;
    if (lead.linkedin_url || lead.website) score += 5;

    // Checklist Items
    if (lead.checklist) {
        const checklist = typeof lead.checklist === 'string' ? JSON.parse(lead.checklist) : lead.checklist;
        if (checklist.hasInstagram) score += 20;
        if (checklist.hasRender) score += 20;
    }

    return score;
}

export const LeadsService = {
    async getDashboardUsers() {
        const users = await prisma.user.findMany({
            // fetch all relevant users
            // where: { OR: [{ role: 'admin' }, { role: 'seller' }] }
            // For now fetch all to be safe and filter if needed, or just all.
        });

        return users.map(u => ({
            key: u.email.split('@')[0].toLowerCase(), // 'joao', 'vitor'
            name: u.name,
            id: u.id, // Primary ID
            avatar: u.avatar_url,
            role: u.role,
            xp: u.xp,
            level: u.level,
            ids: [u.id, u.supabase_uid].filter(Boolean),
            names: [u.name, u.email, u.name.toLowerCase()].filter(Boolean)
        }));
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
            const data = { ...lead, deletedAt: null };
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
                    { decision_maker: { contains: filters.search, mode: 'insensitive' } }
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
            const [leads, total, joaoTotal, vitorTotal, unassignedTotal] = await Promise.all([
                prisma.leads.findMany({
                    skip,
                    take: Number(limit),
                    where,
                    orderBy,
                    include: { contacts: { where: { is_primary: true } } }
                }),
                prisma.leads.count({ where }), // Total matching filters
                prisma.leads.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
                prisma.leads.count({ where: { owner: 'vitor', deletedAt: null } }),
                prisma.leads.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
            ]);
            console.log(`[LeadsService] Queries success. Found ${leads.length} leads.`);
            return {
                data: leads,
                meta: {
                    total,
                    joaoTotal,
                    vitorTotal,
                    unassignedTotal,
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

        // Allow explicit userId override for attribution
        if (data.userId) sanitizedData.userId = data.userId;

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
                    user_id: data.userId || sanitizedData.owner_id || currentLead.owner_id || 'system',
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
            // Priority: Explicit Trigger Owner -> Lead Owner -> System
            // We need to ensure the action is credited to the person PERFORMING IT if possible, 
            // but usually credit goes to the lead owner.
            const userToReward = sanitizedData.owner_id || currentLead.owner_id;

            if (userToReward) {
                // Map status to action
                const newStatus = sanitizedData.status;

                // STATUS MAPPING ABSTRACTION (Requested by User)
                // "Step 1, 2, 3" -> Conceptual mapping to meaningful XP events
                // NEW -> 
                // ATTEMPTED -> Step 1 (Tentativa)
                // CONTACTED -> Step 2 (Contato Realizado) -> LEAD_CONTACTED
                // MEETING -> Step 3 (Reunião) -> LEAD_QUALIFIED
                // SOLD -> Step 4 (Venda) -> LEAD_CONVERTED

                if (newStatus === 'CONTACTED') {
                    await GamificationService.addXP(userToReward, 'LEAD_CONTACTED');
                } else if (newStatus === 'MEETING') {
                    await GamificationService.addXP(userToReward, 'LEAD_QUALIFIED');
                } else if (newStatus === 'SOLD') {
                    await GamificationService.addXP(userToReward, 'LEAD_CONVERTED');
                } else if (newStatus === 'WON') {
                    // Deprecated or "Em Fechamento"
                    await GamificationService.addXP(userToReward, 'TASK_COMPLETED');
                }

                // For future "Step X" logic if user implements custom columns:
                if (newStatus.toLowerCase().includes('step 1')) await GamificationService.addXP(userToReward, 'TASK_COMPLETED');
                if (newStatus.toLowerCase().includes('step 2')) await GamificationService.addXP(userToReward, 'LEAD_CONTACTED');
                if (newStatus.toLowerCase().includes('step 3')) await GamificationService.addXP(userToReward, 'LEAD_QUALIFIED');
                if (newStatus.toLowerCase().includes('step 4')) await GamificationService.addXP(userToReward, 'LEAD_CONVERTED');
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


    async getStatsOverview(ownerId?: string, minDate?: Date, maxDate?: Date) {
        const baseWhere: any = { deletedAt: null };
        if (ownerId) {
            baseWhere.OR = [
                { owner_id: ownerId },
                { owner_id: null }
            ];
        }
        if (minDate) {
            baseWhere.date_added = { gte: minDate };
        }
        if (maxDate) {
            if (!baseWhere.date_added) baseWhere.date_added = {};
            baseWhere.date_added.lte = maxDate;
        }

        // For interactions based stats (Sales, Money on Table), we should ideally filter by interaction date too
        // But the current implementation aggregates on LEADS status.
        // If we want "Sales in Period", we should look at interactions or date_sold. 
        // Current implementation is "Leads currently in SOLD status, that were added in Period X". 
        // This is a proxy. A better one: "Leads that moved to SOLD in Period X".
        // However, for consistency with current logic, let's keep it simple first: Filter everything by Lead Creation Date?
        // NO. "Sales this week" means "Leads sold this week", not "Leads created this week that are now sold".

        // CORRECTION for Filters:
        // Revenue/Sales -> Needs to filter by date of Sale (Interaction or Metadata)
        // Pipeline -> Needs to be current snapshot (Active leads regardless of creation date? Or created in period?)
        // Usually, Pipeline is "Current Snapshot". Sales is "Period Flow".

        // Let's refine baseWhere for specific queries below instead of global baseWhere if possible.
        // But typically dashboards filter "Data related to leads created in X" OR "Activities in X".
        // Given the request "Adjust all statistics... analysis period", usually implies Activity.

        // Let's stick to "Leads Created in Period" for now as the primary filter for "Volume", 
        // and for Sales/Revenue try to filter by "Status Change Date" if possible, or fallback to Created.

        // Actually, the previous implementation of getStatsOverview sums `contract_value` of leads with status `SOLD`.
        // If we apply `date_added` filter, we only see revenue from leads created in that period. 
        // This is often what marketing wants ("Cohort Analysis"). 
        // Sales teams want "Closed in Period".

        // For this sprint, to be safe and consistent with the "Filter" concept:
        // We will apply the date filter to the LEAD CREATION DATE for the general counts.
        // For REVENUE, we should try to find leads sold in that period. 

        // SPRINT 11 DECISION: Apply filter to `date_added` for all lead-based counts.

        const [total, byStatus, byOwner, addedToday, addedThisWeek, addedThisMonth, revenueStats, pipelineStats, broadPipelineStats] = await Promise.all([
            prisma.leads.count({ where: baseWhere }),
            prisma.leads.groupBy({
                by: ['status'],
                where: baseWhere,
                _count: { status: true }
            }),
            prisma.leads.groupBy({
                by: ['owner'],
                where: baseWhere,
                _count: { owner: true }
            }),
            prisma.leads.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            }),
            prisma.leads.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.leads.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            }),
            // Revenue (SOLD)
            prisma.leads.aggregate({
                where: { ...baseWhere, status: 'SOLD' },
                _sum: { contract_value: true }
            }),
            // Money on Table (MEETING + WON (Em Fechamento))
            prisma.leads.aggregate({
                where: { ...baseWhere, status: { in: ['MEETING', 'WON'] } },
                _sum: { contract_value: true }
            }),
            // Total Pipeline (Broadly)
            prisma.leads.aggregate({
                where: { ...baseWhere, status: { in: ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON'] } },
                _sum: { contract_value: true }
            })
        ]);

        const statusCounts: Record<string, number> = {};
        byStatus.forEach((s: any) => { statusCounts[s.status] = s._count.status; });

        const ownerCounts: Record<string, number> = {};
        byOwner.forEach((o: any) => { ownerCounts[o.owner || 'unassigned'] = o._count.owner; });

        return {
            total,
            byStatus: statusCounts,
            byOwner: ownerCounts,
            addedToday,
            addedThisWeek,
            addedThisMonth,
            revenue: revenueStats._sum.contract_value ? Number(revenueStats._sum.contract_value.toString()) : 0,
            moneyOnTable: pipelineStats._sum.contract_value ? Number(pipelineStats._sum.contract_value.toString()) : 0,
            pipelineValue: broadPipelineStats?._sum?.contract_value ? Number(broadPipelineStats._sum.contract_value.toString()) : 0
        };
    },

    async getUpcomingMeetings(limit = 10) {
        // Fetch leads with scheduled follow-ups (interpreted as meetings/tasks)
        // Filter: next_followup_date >= NOW
        const meetings = await prisma.leads.findMany({
            where: {
                deletedAt: null,
                next_followup_date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)) // Start of TODAY
                }
            },
            take: limit,
            orderBy: {
                next_followup_date: 'asc'
            },
            select: {
                id: true,
                company_name: true,
                trade_name: true,
                next_followup_date: true,
                owner: true,
                owner_id: true,
                User: {
                    select: {
                        name: true,
                        avatar_url: true
                    }
                }
            }
        });

        // Map to cleaner structure
        return meetings.map(m => ({
            id: m.id,
            title: m.trade_name || m.company_name || 'Lead sem nome',
            date: m.next_followup_date,
            ownerName: m.User?.name || m.owner || 'N/A',
            ownerAvatar: m.User?.avatar_url
        }));
    },

    async getConversionFunnel(minDate?: Date, maxDate?: Date) {
        const statuses = ['INBOX', 'NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'LOST', 'DISQUALIFIED'];

        // Define our dashboard users
        const users = await this.getDashboardUsers();

        // Fetch all non-deleted leads with owner info AND minDate filter
        const whereClause: any = { deletedAt: null };
        if (minDate) {
            whereClause.date_added = { gte: minDate };
        }
        if (maxDate) {
            if (!whereClause.date_added) whereClause.date_added = {};
            whereClause.date_added.lte = maxDate;
        }

        const allLeads = await prisma.leads.findMany({
            where: whereClause,
            select: { status: true, owner: true, owner_id: true }
        });

        // Initialize map
        const map: Record<string, any> = {};
        statuses.forEach(s => {
            map[s] = { total: 0 };
            users.forEach(u => map[s][u.key] = 0);
        });

        const totalLeads = allLeads.length;

        allLeads.forEach(lead => {
            const s = lead.status;
            if (!map[s]) {
                map[s] = { total: 0 };
                users.forEach(u => map[s][u.key] = 0);
            }

            map[s].total++;

            // Check which user owns this lead
            let foundOwner = false;
            for (const user of users) {
                const isOwner = (lead.owner_id && user.ids.includes(lead.owner_id)) ||
                    (lead.owner && user.names.some(n => n.toLowerCase() === lead.owner?.toLowerCase()));

                if (isOwner) {
                    map[s][user.key]++;
                    foundOwner = true;
                    break;
                }
            }
        });

        return statuses.map(status => {
            const entry: any = {
                status,
                count: map[status].total,
                percentage: totalLeads > 0 ? Math.round((map[status].total / totalLeads) * 100) : 0
            };
            users.forEach(u => {
                entry[u.key] = map[status][u.key];
            });
            return entry;
        });
    },



    async getTimelineStats(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Fetch added leads
        const addedLeads = await prisma.leads.findMany({
            where: {
                deletedAt: null,
                date_added: { gte: startDate }
            },
            select: { date_added: true }
        });

        // Fetch all interactions (including STATUS_CHANGE)
        const interactions = await prisma.interactions.findMany({
            where: { date: { gte: startDate } },
            select: { date: true, type: true, content: true }
        });

        // Initialize date map with dynamic structure
        const byDate: Record<string, any> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = date.toISOString().split('T')[0];
            byDate[key] = { date: key, added: 0, contacted: 0, scheduled: 0 };
        }

        // Aggregate added leads
        addedLeads.forEach((lead: any) => {
            const key = lead.date_added.toISOString().split('T')[0];
            if (byDate[key]) byDate[key].added++;
        });

        // Aggregate interactions
        interactions.forEach((int: any) => {
            const key = int.date.toISOString().split('T')[0];
            if (!byDate[key]) return;

            if (['CALL', 'EMAIL', 'WHATSAPP'].includes(int.type)) {
                byDate[key].contacted++;
            } else if (int.type === 'MEETING') {
                byDate[key].scheduled++;
            } else if (int.type === 'STATUS_CHANGE') {
                // Parse formats: "MOVETO:STATUS" or "Status alterado de X para STATUS"
                let status = null;
                if (int.content.startsWith('MOVETO:')) {
                    status = int.content.split(':')[1];
                } else {
                    const match = int.content.match(/para\s+([A-Z_]+)/i);
                    if (match) status = match[1];
                }

                if (status) {
                    const statusKey = status.toUpperCase();
                    if (!byDate[key][statusKey]) byDate[key][statusKey] = 0;
                    byDate[key][statusKey]++;
                }
            }
        });

        // 6. Ensure all date entries have all status keys (even if 0) to prevent Recharts issues
        const allKeys = new Set<string>(['added', 'contacted', 'scheduled']);
        const values = Object.values(byDate);
        values.forEach((v: any) => {
            Object.keys(v).forEach(k => allKeys.add(k));
        });

        const finalized = values.map((v: any) => {
            const entry = { ...v };
            allKeys.forEach(k => {
                if (entry[k] === undefined) entry[k] = 0;
            });
            return entry;
        });

        return finalized.sort((a: any, b: any) => a.date.localeCompare(b.date));
    },

    async getPerformanceByOwner(minDate?: Date, maxDate?: Date) {
        // Fetch users dynamically
        const users = await this.getDashboardUsers();

        const result: Record<string, any> = {};
        const todayReset = new Date();
        todayReset.setHours(0, 0, 0, 0);

        // Parallel fetch for each user
        await Promise.all(users.map(async (user) => {
            const userLeadWhere: any = {
                OR: [
                    { owner_id: { in: user.ids } },
                    ...user.names.map(name => ({ owner: { equals: name, mode: 'insensitive' as const } }))
                ],
                deletedAt: null
            };

            const userFilter = {
                OR: [
                    { user_id: { in: user.ids } },
                    ...user.names.map(name => ({ user_id: { equals: name, mode: 'insensitive' as const } }))
                ]
            };

            const periodFilter: any = {};
            if (minDate) periodFilter.date = { gte: minDate };
            if (maxDate) {
                if (!periodFilter.date) periodFilter.date = {};
                periodFilter.date.lte = maxDate;
            }
            const todayFilter = { date: { gte: todayReset } };

            const periodInteractionWhere = { AND: [userFilter, periodFilter] };
            const todayInteractionWhere = { AND: [userFilter, todayFilter] };

            // Metrics from INTERACTIONS (Actions)
            const [
                totalLeads,
                addedPeriod, // Was addedToday, now added in Period
                soldActions,
                meetingActions,
                contactActions,
                xpTodayInteractions,
                xpPeriodInteractions,
                revenueData,
                statusGroup
            ] = await Promise.all([
                // Total leads (inventory - Lifetime)
                prisma.leads.count({ where: userLeadWhere }),

                // Leads Added in Period (Leads New)
                prisma.leads.count({
                    where: {
                        AND: [
                            userLeadWhere,
                            (minDate || maxDate) ? { date_added: { gte: minDate, lte: maxDate } } : { date_added: { gte: todayReset } }
                        ] // Default to Today if no period? Or All Time? Let's default to Today if undefined to match old behavior, or handle in route
                    }
                }),

                // Sales: STATUS_CHANGE to SOLD or WON in the period
                prisma.interactions.count({
                    where: {
                        AND: [
                            periodInteractionWhere,
                            {
                                type: 'STATUS_CHANGE',
                                OR: [
                                    { content: { contains: 'SOLD' } },
                                    { content: { contains: 'WON' } },
                                    { content: { contains: 'Venda' } },
                                    { content: { contains: 'Step 4' } }
                                ]
                            }
                        ]
                    }
                }),

                // Meetings: MEETING type or STATUS_CHANGE to MEETING in the period
                prisma.interactions.count({
                    where: {
                        AND: [
                            periodInteractionWhere,
                            {
                                OR: [
                                    { type: 'MEETING' },
                                    { type: 'STATUS_CHANGE', content: { contains: 'MEETING' } },
                                    { type: 'STATUS_CHANGE', content: { contains: 'Step 3' } }
                                ]
                            }
                        ]
                    }
                }),

                // Contacts: CALL, WHATSAPP, EMAIL or STATUS_CHANGE to CONTACTED in the period
                prisma.interactions.count({
                    where: {
                        AND: [
                            periodInteractionWhere,
                            {
                                OR: [
                                    { type: { in: ['CALL', 'WHATSAPP', 'EMAIL', 'CONTACT'] } },
                                    { type: 'STATUS_CHANGE', content: { contains: 'CONTACTED' } },
                                    { type: 'STATUS_CHANGE', content: { contains: 'Step 2' } }
                                ]
                            }
                        ]
                    }
                }),

                // XP Today (Summing up actions)
                prisma.interactions.findMany({
                    where: todayInteractionWhere,
                    select: { type: true, content: true }
                }),

                // XP Period
                prisma.interactions.findMany({
                    where: periodInteractionWhere,
                    select: { type: true, content: true }
                }),

                // Revenue: SUM of contract_value for leads sold in the period
                prisma.leads.aggregate({
                    where: {
                        ...userLeadWhere,
                        status: 'SOLD',
                    },
                    _sum: { contract_value: true }
                }),

                // Status Counts (Snapshot for Player Card)
                prisma.leads.groupBy({
                    by: ['status'],
                    where: userLeadWhere,
                    _count: { status: true }
                })
            ]);

            // Map status counts
            const statusMap: Record<string, number> = {};
            const statusCounts = statusGroup || [];
            statusCounts.forEach((s: any) => { statusMap[s.status] = s._count.status; });

            // Calculate XP from interactions manually (since ACTION_POINTS is code-side)
            const calculateXP = (ints: any[]) => {
                return ints.reduce((acc, int) => {
                    let xp = 0;
                    if (int.type === 'STATUS_CHANGE' || int.type === 'MOVETO') {
                        if (int.content.includes('SOLD') || int.content.includes('WON') || int.content.includes('Step 4')) xp = ACTION_POINTS.LEAD_CONVERTED;
                        else if (int.content.includes('MEETING') || int.content.includes('Step 3')) xp = ACTION_POINTS.LEAD_QUALIFIED;
                        else if (int.content.includes('CONTACTED') || int.content.includes('Step 2')) xp = ACTION_POINTS.LEAD_CONTACTED;
                        else xp = 10; // Basic move
                    } else if (int.type === 'MEETING' || int.type === 'QUALIFY') xp = ACTION_POINTS.LEAD_QUALIFIED;
                    else if (['CALL', 'WHATSAPP', 'EMAIL', 'CONTACT'].includes(int.type)) xp = ACTION_POINTS.LEAD_CONTACTED;
                    else if (int.type === 'CREATE') xp = ACTION_POINTS.LEAD_CREATED;
                    else if (int.type === 'IMPORT') xp = (parseInt(int.content.split(':')[1]) || 1) * ACTION_POINTS.BULK_IMPORT;
                    return acc + xp;
                }, 0);
            };

            const xpToday = calculateXP(xpTodayInteractions);
            const xpPeriod = calculateXP(xpPeriodInteractions);

            // Use Snapshot Counts for "Card Stats" to match user expectation
            // Responses = Leads in CONTACTED status
            // Meeting = Leads in MEETING status
            const currentContacted = statusMap['CONTACTED'] || 0;
            const currentMeeting = statusMap['MEETING'] || 0;

            result[user.key] = {
                total: totalLeads,
                addedToday: addedPeriod,
                won: 0,
                sold: soldActions,
                contacted: currentContacted, // Use snapshot count
                meeting: currentMeeting, // Use snapshot count
                added: totalLeads, // Keep mapped to Total for Card
                revenue: revenueData._sum.contract_value ? Number(revenueData._sum.contract_value) : 0,
                conversionRate: totalLeads > 0 ? Math.round((soldActions / totalLeads) * 100) : 0,
                xpToday,
                xpPeriod,
                score: Math.min(70 + (soldActions * 5) + (meetingActions * 2), 99), // Keep Score based on Activity
                meta: {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    role: user.role,
                    xp: user.xp,
                    level: user.level
                }
            };
        }));

        return result;
    }
    ,

    async getLeadsByState() {
        const leads = await prisma.leads.findMany({
            where: { deletedAt: null },
            select: { extra_info: true, uf: true }
        });

        const regionStates: Record<string, string[]> = {
            'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
            'Sul': ['PR', 'SC', 'RS'],
            'Nordeste': ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI'],
            'Centro-Oeste': ['GO', 'MT', 'MS', 'DF'],
            'Norte': ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
        };

        const regionData: Record<string, number> = {
            'Sudeste': 0,
            'Sul': 0,
            'Nordeste': 0,
            'Centro-Oeste': 0,
            'Norte': 0,
            'Sem UF': 0,
        };

        leads.forEach((lead: any) => {
            const info = lead.extra_info as any;
            const uf = lead.uf || info?.uf || info?.estado?.sigla || info?.endereco?.uf;
            if (uf && typeof uf === 'string') {
                const upperUf = uf.toUpperCase();
                let found = false;
                for (const [region, states] of Object.entries(regionStates)) {
                    if (states.includes(upperUf)) {
                        regionData[region]++;
                        found = true;
                        break;
                    }
                }
                if (!found) regionData['Sem UF']++;
            } else {
                regionData['Sem UF']++;
            }
        });

        const total = Object.values(regionData).reduce((a: number, b: number) => a + b, 0);
        return { byRegion: regionData, total };
    },

    async getSalesForce() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const users = await this.getDashboardUsers();

        const result: Record<string, any> = {};

        await Promise.all(users.map(async (user) => {
            const userWhere = {
                OR: [
                    { owner_id: { in: user.ids } },
                    ...user.names.map(name => ({ owner: { equals: name, mode: 'insensitive' as const } }))
                ],
                deletedAt: null
            };

            const [
                contactedToday, contactedWeek, contactedMonth,
                meetingsToday, meetingsWeek, meetingsMonth,
                wonToday, wonWeek, wonMonth,
                totalActive
            ] = await Promise.all([
                prisma.leads.count({ where: { ...userWhere, last_contact_date: { gte: startOfDay } } }),
                prisma.leads.count({ where: { ...userWhere, last_contact_date: { gte: startOfWeek } } }),
                prisma.leads.count({ where: { ...userWhere, last_contact_date: { gte: startOfMonth } } }),
                prisma.leads.count({ where: { ...userWhere, status: 'MEETING', next_followup_date: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) } } }),
                prisma.leads.count({ where: { ...userWhere, status: 'MEETING' } }),
                prisma.leads.count({ where: { ...userWhere, status: 'MEETING' } }),
                prisma.leads.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfDay } } }),
                prisma.leads.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfWeek } } }),
                prisma.leads.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfMonth } } }),
                prisma.leads.count({ where: { ...userWhere, status: { notIn: ['WON', 'LOST'] } } }),
            ]);

            result[user.key] = {
                today: { contacted: contactedToday, meetings: meetingsToday, won: wonToday },
                week: { contacted: contactedWeek, meetings: meetingsWeek, won: wonWeek },
                month: { contacted: contactedMonth, meetings: meetingsMonth, won: wonMonth },
                totalActive,
                score: {
                    today: contactedToday * 1 + meetingsToday * 3 + wonToday * 10,
                    week: contactedWeek * 1 + meetingsWeek * 3 + wonWeek * 10,
                    month: contactedMonth * 1 + meetingsMonth * 3 + wonMonth * 10,
                }
            };
        }));

        return result;
    },



    async getRecentActivity(limit = 15) {
        const interactions = await prisma.interactions.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { leads: true }
        });

        const users = await this.getDashboardUsers();

        return interactions.map((interaction: any) => {
            let type: 'conversion' | 'task' | 'streak' | 'lead' = 'task';
            let message = '';
            let xp = 0;

            // Resolve User Name
            let userName = 'Consultor';
            const user = users.find(u => u.ids.includes(interaction.user_id) || u.names.some(n => n.toLowerCase() === (interaction.user_id || '').toLowerCase()));
            if (user) userName = user.name;
            else if (interaction.user_id && interaction.user_id !== 'system') userName = interaction.user_id;

            // Determine type and XP based on interaction
            if (interaction.type === 'STATUS_CHANGE') {
                if (interaction.content.includes('WON') || interaction.content.includes('SOLD') || interaction.content.includes('Venda')) {
                    type = 'conversion';
                    message = `${userName} fechou uma venda!`;
                    xp = ACTION_POINTS.LEAD_CONVERTED;
                } else {
                    type = 'lead';
                    message = `${userName} moveu um lead`;
                    xp = 25; // Base move
                }
            } else if (interaction.type === 'MEETING') {
                type = 'task';
                message = `${userName} agendou uma reunião`;
                xp = ACTION_POINTS.LEAD_QUALIFIED;
            } else if (['CALL', 'WHATSAPP', 'EMAIL'].includes(interaction.type)) {
                type = 'lead';
                message = `${userName} realizou um contato`;
                xp = ACTION_POINTS.LEAD_CONTACTED;
            } else if (interaction.type === 'NOTE') {
                type = 'lead';
                message = `${userName} adicionou uma nota`;
                xp = 10;
            } else if (interaction.type === 'IMPORT') {
                type = 'lead';
                const count = interaction.content.split(':')[1] || 'vários';
                message = `${userName} importou ${count} leads`;
                xp = parseInt(count) * ACTION_POINTS.BULK_IMPORT || 50;
            } else if (interaction.type === 'CREATE') {
                type = 'lead';
                message = `${userName} adicionou um lead`;
                xp = ACTION_POINTS.LEAD_CREATED;
            } else if (interaction.type === 'LEVEL_UP') {
                type = 'streak';
                const level = interaction.content.split(':')[1];
                message = `${userName} subiu para o nível ${level}!`;
                xp = 0;
            }

            // Fallback for custom content
            if (!message && interaction.content) {
                if (interaction.content.length > 50) message = interaction.content.substring(0, 50) + '...';
                else message = interaction.content;
            }

            return {
                id: interaction.id,
                message,
                xp,
                timestamp: interaction.date,
                type,
                userName
            };
        });
    },

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

    async getHourlyActivity(ownerId?: string) {
        const now = new Date();
        // End at the next hour marks (e.g. if 10:30, end at 11:00) so we capture the current partial hour fully
        // Actually, simpler: start at "current hour - 23"
        const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        const startOfWindow = new Date(currentHourStart.getTime() - 23 * 60 * 60 * 1000);

        // Fetch interactions and new leads in parallel
        const [interactions, newLeads] = await Promise.all([
            prisma.interactions.findMany({
                where: {
                    date: { gte: startOfWindow },
                    ...(ownerId ? { user_id: ownerId } : {})
                },
                select: { date: true, type: true, content: true }
            }),
            prisma.leads.findMany({
                where: {
                    date_added: { gte: startOfWindow },
                    deletedAt: null,
                    ...(ownerId ? { owner_id: ownerId } : {})
                },
                select: { date_added: true }
            })
        ]);

        // Initialize 24-hour rolling window buckets
        const hourlyData: any[] = [];
        for (let i = 0; i < 24; i++) {
            const date = new Date(startOfWindow.getTime() + i * 60 * 60 * 1000);
            hourlyData.push({
                // Store timestamp for reference, but use 'label' for the X-axis
                timestamp: date.getTime(),
                label: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                added: 0,
                contacts: 0,
                messages: 0,
                meetings: 0
            });
        }

        const getBucketIndex = (date: Date) => {
            const diffMs = date.getTime() - startOfWindow.getTime();
            const hourIndex = Math.floor(diffMs / (1000 * 60 * 60));
            // Clamp strictly to 0-23
            if (hourIndex < 0) return 0;
            if (hourIndex > 23) return 23;
            return hourIndex;
        };

        // Process Leads Adicionados
        newLeads.forEach(lead => {
            const idx = getBucketIndex(lead.date_added);
            if (hourlyData[idx]) hourlyData[idx].added++;
        });

        // Process Interactions
        interactions.forEach(int => {
            const idx = getBucketIndex(new Date(int.date));
            if (!hourlyData[idx]) return;

            const type = int.type;
            const content = int.content || '';

            if (type === 'CALL' || type === 'EMAIL' || type === 'CONTACT') {
                hourlyData[idx].contacts++;
            } else if (type === 'WHATSAPP') {
                hourlyData[idx].messages++;
            } else if (type === 'MEETING' || (type === 'STATUS_CHANGE' && (content.includes('MEETING') || content.includes('AGENDADA')))) {
                hourlyData[idx].meetings++;
            }
        });

        return hourlyData.sort((a, b) => a.timestamp - b.timestamp);
    },

    async getActivityTrend(startDate: Date, endDate: Date, ownerId?: string) {
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const isSingleDay = diffDays <= 1.1; // Allow some margin for 24h/daily resets

        // Fetch interactions and new leads in parallel
        const [interactions, newLeads] = await Promise.all([
            prisma.interactions.findMany({
                where: {
                    date: { gte: startDate, lte: endDate },
                    ...(ownerId ? { user_id: ownerId } : {})
                },
                select: { date: true, type: true, content: true }
            }),
            prisma.leads.findMany({
                where: {
                    date_added: { gte: startDate, lte: endDate },
                    deletedAt: null,
                    ...(ownerId ? { owner_id: ownerId } : {})
                },
                select: { date_added: true }
            })
        ]);

        if (isSingleDay) {
            // Initialize 24 hours (0-23)
            const hourlyData = Array.from({ length: 24 }, (_, i) => ({
                label: `${i.toString().padStart(2, '0')}:00`,
                added: 0,
                contacts: 0,
                messages: 0,
                meetings: 0
            }));

            newLeads.forEach(lead => {
                const hour = lead.date_added.getHours();
                hourlyData[hour].added++;
            });

            interactions.forEach(int => {
                const hour = new Date(int.date).getHours();
                const type = int.type;
                const content = int.content || '';

                if (type === 'CALL' || type === 'EMAIL' || type === 'CONTACT') {
                    hourlyData[hour].contacts++;
                } else if (type === 'WHATSAPP') {
                    hourlyData[hour].messages++;
                } else if (type === 'MEETING' || (type === 'STATUS_CHANGE' && content.includes('MEETING'))) {
                    hourlyData[hour].meetings++;
                }
            });

            return hourlyData;
        } else {
            // Group by Day
            const dailyMap = new Map<string, any>();

            // Pre-fill days in range
            let current = new Date(startDate);
            while (current <= endDate) {
                const key = current.toISOString().split('T')[0];
                dailyMap.set(key, {
                    label: key, // YYYY-MM-DD
                    added: 0,
                    contacts: 0,
                    messages: 0,
                    meetings: 0
                });
                current.setDate(current.getDate() + 1);
            }

            newLeads.forEach(lead => {
                const key = lead.date_added.toISOString().split('T')[0];
                if (dailyMap.has(key)) dailyMap.get(key).added++;
            });

            interactions.forEach(int => {
                const key = new Date(int.date).toISOString().split('T')[0];
                if (dailyMap.has(key)) {
                    const entry = dailyMap.get(key);
                    const type = int.type;
                    const content = int.content || '';

                    if (type === 'CALL' || type === 'EMAIL' || type === 'CONTACT') {
                        entry.contacts++;
                    } else if (type === 'WHATSAPP') {
                        entry.messages++;
                    } else if (type === 'MEETING' || (type === 'STATUS_CHANGE' && content.includes('MEETING'))) {
                        entry.meetings++;
                    }
                }
            });

            return Array.from(dailyMap.values()).sort((a, b) => a.label.localeCompare(b.label));
        }
    }
};
