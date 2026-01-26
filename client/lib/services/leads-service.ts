import prisma from '../prisma';
import { LeadSanitizer } from './lead-sanitizer';

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
    async create(data: any) {
        // Extract contacts before sanitization (as sanitizer strips unknown fields)
        const { contacts, ...leadData } = data;

        // Use strict sanitizer
        const sanitized = LeadSanitizer.sanitizeForCreate(leadData);

        // Handle missing CNPJ for manual leads
        if (!sanitized.cnpj || sanitized.cnpj.trim() === '') {
            sanitized.cnpj = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        const createData: any = {
            ...sanitized,
            owner_id: data.owner_id || undefined, // Explicitly pass owner_id
        };

        // Handle nested contacts creation
        if (Array.isArray(contacts) && contacts.length > 0) {
            createData.contacts = {
                create: contacts.map((contact: any) => {
                    const { id, lead_id, ...contactFields } = contact;
                    return contactFields;
                })
            };
        }

        const lead = await prisma.lead.create({
            data: createData,
        });

        // Log creation as interaction for the feed
        await prisma.interaction.create({
            data: {
                lead_id: lead.id,
                type: 'CREATE',
                content: 'Lead criado manualmente',
                user_id: lead.owner_id || data.owner || 'system'
            }
        });

        return lead;
    },

    async createMany(leads: any[], userId?: string) {
        const ops = leads.map((lead: any) => {
            const data = { ...lead, deletedAt: null };
            return prisma.lead.upsert({
                where: { cnpj: lead.cnpj },
                create: data as any,
                update: data as any,
            });
        });

        const results = await prisma.$transaction(ops);

        // Log import as a single interaction for the feed
        if (results.length > 0) {
            await prisma.interaction.create({
                data: {
                    lead_id: results[0].id, // Link to first lead in batch
                    type: 'IMPORT',
                    content: `IMPORT:${results.length}`,
                    user_id: userId || 'system'
                }
            });
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
                prisma.lead.findMany({
                    skip,
                    take: Number(limit),
                    where,
                    orderBy,
                    include: { contacts: { where: { is_primary: true } } }
                }),
                prisma.lead.count({ where }), // Total matching filters
                prisma.lead.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
                prisma.lead.count({ where: { owner: 'vitor', deletedAt: null } }),
                prisma.lead.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
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
        return prisma.lead.findUnique({
            where: { id },
            include: {
                segment: true,
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
        return prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },

    async removeMany(ids: string[]) {
        return prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        });
    },

    async restore(id: string) {
        return prisma.lead.update({
            where: { id },
            data: { deletedAt: null }
        });
    },

    async restoreMany(ids: string[]) {
        return prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null }
        });
    },

    async hardDelete(id: string) {
        return prisma.lead.delete({
            where: { id }
        });
    },

    async findAllTrashed() {
        return prisma.lead.findMany({
            where: { NOT: { deletedAt: null } },
            orderBy: { deletedAt: 'desc' }
        });
    },

    async updateMany(ids: string[], updateData: any) {
        return prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: updateData,
        });
    },

    async disqualify(id: string) {
        return prisma.lead.update({
            where: { id },
            data: { status: 'DISQUALIFIED' }
        });
    },

    // Expose calculateScore if needed elsewhere, referencing the helper
    calculateScore,

    async update(id: string, data: any) {
        // Use strict sanitizer for update
        const sanitizedData = LeadSanitizer.sanitizeForUpdate(data);

        // Defensive check: if no fields are left after sanitization, skip DB call
        if (Object.keys(sanitizedData).length === 0) {
            console.warn(`[LeadsService] Update called for ${id} but no valid fields were provided.`);
            return prisma.lead.findUnique({ where: { id } });
        }

        // Always fetch current lead for status change tracking
        const currentLead = await prisma.lead.findUnique({
            where: { id },
            select: { extra_info: true, website_url: true, instagram_url: true, render_quality: true, status: true, owner: true, owner_id: true }
        });

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
            await prisma.interaction.create({
                data: {
                    lead_id: id,
                    type: 'STATUS_CHANGE',
                    content: `MOVETO:${sanitizedData.status}`, // Machine readable format
                    user_id: sanitizedData.owner_id || currentLead.owner_id || 'system'
                }
            });
        }

        return prisma.lead.update({
            where: { id },
            data: sanitizedData,
        });
    }
    ,

    async cleanupDuplicates() {
        const allLeads = await prisma.lead.findMany({
            where: { deletedAt: null },
            orderBy: { date_added: 'asc' }
        });

        const toDeleteIds = new Set<string>();

        const checkDuplicates = (keyFn: (l: any) => string | null) => {
            const groups = new Map<string, any[]>();
            for (const lead of allLeads) {
                const key = keyFn(lead);
                if (!key) continue;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(lead);
            }

            for (const [key, group] of groups) {
                if (group.length > 1) {
                    const withUserNotes = group.filter(l => {
                        if (!l.notes || l.notes.trim().length === 0) return false;
                        const note = l.notes.toLowerCase().trim();
                        if (note.startsWith('deep discovery')) return false;
                        return true;
                    });

                    let keptLeads: any[] = [];
                    if (withUserNotes.length > 0) {
                        keptLeads = withUserNotes;
                    } else {
                        const scored = group.map(l => ({
                            lead: l,
                            score: (l.email && l.email.trim().length > 5 ? 1 : 0) +
                                (l.phone && l.phone.replace(/[^0-9]/g, '').length >= 8 ? 1 : 0)
                        }));
                        const maxScore = Math.max(...scored.map(s => s.score));
                        const bestLeads = scored.filter(s => s.score === maxScore).map(s => s.lead);
                        keptLeads = [bestLeads[0]];
                    }
                    const keptIds = new Set(keptLeads.map(l => l.id));
                    for (const lead of group) {
                        if (!keptIds.has(lead.id)) toDeleteIds.add(lead.id);
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

        if (toDeleteIds.size > 0) {
            const ids = Array.from(toDeleteIds);
            await this.removeMany(ids);
            return { deletedCount: ids.length, ids };
        }
        return { deletedCount: 0, ids: [] };
    },


    async getStatsOverview(ownerId?: string) {
        const baseWhere: any = { deletedAt: null };
        if (ownerId) {
            baseWhere.OR = [
                { owner_id: ownerId },
                { owner_id: null }
            ];
        }

        const [total, byStatus, byOwner, addedToday, addedThisWeek, addedThisMonth, revenueStats, pipelineStats, broadPipelineStats] = await Promise.all([
            prisma.lead.count({ where: baseWhere }),
            prisma.lead.groupBy({
                by: ['status'],
                where: baseWhere,
                _count: { status: true }
            }),
            prisma.lead.groupBy({
                by: ['owner'],
                where: baseWhere,
                _count: { owner: true }
            }),
            prisma.lead.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            }),
            prisma.lead.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.lead.count({
                where: {
                    ...baseWhere,
                    date_added: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            }),
            // Revenue (SOLD)
            prisma.lead.aggregate({
                where: { ...baseWhere, status: 'SOLD' },
                _sum: { contract_value: true }
            }),
            // Money on Table (MEETING + WON (Em Fechamento))
            prisma.lead.aggregate({
                where: { ...baseWhere, status: { in: ['MEETING', 'WON'] } },
                _sum: { contract_value: true }
            }),
            // Total Pipeline (Broadly)
            prisma.lead.aggregate({
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
        const meetings = await prisma.lead.findMany({
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
                owner_user: {
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
            ownerName: m.owner_user?.name || m.owner || 'N/A',
            ownerAvatar: m.owner_user?.avatar_url
        }));
    },

    async getConversionFunnel(minDate?: Date) {
        const statuses = ['INBOX', 'NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'LOST', 'DISQUALIFIED'];

        // Define our dashboard users
        const users = [
            { key: 'joao', name: 'João', ids: ['21d216a4-e8c9-464d-b486-0b4db827f5ba'], names: ['joao', 'João Vitor'] },
            { key: 'bruno', name: 'Bruno', ids: ['0184fc53-a696-4ed6-b5e4-2391fd21b902'], names: ['bruno', 'Bruno'] },
            { key: 'nitz', name: 'Nitz', ids: ['1e83c3b1-b8ed-4a59-a37b-4425947525ea'], names: ['nitz', 'Nitz'] }
        ];

        // Fetch all non-deleted leads with owner info AND minDate filter
        const whereClause: any = { deletedAt: null };
        if (minDate) {
            whereClause.date_added = { gte: minDate };
        }

        const allLeads = await prisma.lead.findMany({
            where: whereClause,
            select: { status: true, owner: true, owner_id: true }
        });

        // Initialize map
        const map: Record<string, any> = {};
        statuses.forEach(s => {
            map[s] = { total: 0, joao: 0, bruno: 0, nitz: 0 };
        });

        const totalLeads = allLeads.length;

        allLeads.forEach(lead => {
            const s = lead.status;
            if (!map[s]) map[s] = { total: 0, joao: 0, bruno: 0, nitz: 0 };

            map[s].total++;

            // Check which user owns this lead
            for (const user of users) {
                const isOwner = (lead.owner_id && user.ids.includes(lead.owner_id)) ||
                    (lead.owner && user.names.some(n => n.toLowerCase() === lead.owner?.toLowerCase()));

                if (isOwner) {
                    map[s][user.key]++;
                    break; // Assume single owner
                }
            }
        });

        return statuses.map(status => ({
            status,
            count: map[status].total,
            joao: map[status].joao,
            bruno: map[status].bruno,
            nitz: map[status].nitz,
            percentage: totalLeads > 0 ? Math.round((map[status].total / totalLeads) * 100) : 0
        }));
    },

    async getTimelineStats(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Fetch added leads
        const addedLeads = await prisma.lead.findMany({
            where: {
                deletedAt: null,
                date_added: { gte: startDate }
            },
            select: { date_added: true }
        });

        // Fetch all interactions (including STATUS_CHANGE)
        const interactions = await prisma.interaction.findMany({
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

    async getPerformanceByOwner(minDate?: Date) {
        // Define users
        const users = [
            { key: 'joao', name: 'João', ids: ['21d216a4-e8c9-464d-b486-0b4db827f5ba'], names: ['joao', 'João Vitor'] },
            { key: 'bruno', name: 'Bruno', ids: ['0184fc53-a696-4ed6-b5e4-2391fd21b902'], names: ['bruno', 'Bruno'] },
            { key: 'nitz', name: 'Nitz', ids: ['1e83c3b1-b8ed-4a59-a37b-4425947525ea'], names: ['nitz', 'Nitz'] }
        ];

        const result: Record<string, any> = {};

        // Parallel fetch for each user to ensure accuracy with complex OR conditions
        await Promise.all(users.map(async (user) => {
            const userWhere: any = {
                OR: [
                    { owner_id: { in: user.ids } },
                    ...user.names.map(name => ({ owner: { equals: name, mode: 'insensitive' as const } }))
                ],
                deletedAt: null
            };

            // Apply date filter if provided (using date_added for general stats, or we could be specific per metric)
            // For general 'Performance', it's best to filter by when the lead entered the system (for New Leads)
            // But for 'Won', 'Contacted', etc. ideally we check the interaction date. 
            // However, this method simplifies to "Leads added or modified in this period"? 
            // To properly reset scores, we usually filter by "Actions happening after date".
            // Since we don't have a robust interaction log for everything here, filtering by 'date_added' resets the "Pipeline".
            if (minDate) {
                userWhere.date_added = { gte: minDate };
            }

            const [total, won, contacted, meeting, added] = await Promise.all([
                prisma.lead.count({ where: userWhere }),
                prisma.lead.count({ where: { ...userWhere, status: 'WON' } }),
                prisma.lead.count({ where: { ...userWhere, status: 'CONTACTED' } }),
                prisma.lead.count({ where: { ...userWhere, status: 'MEETING' } }),
                prisma.lead.count({ where: userWhere }) // 'total' is effectively 'added' or 'assigned', using same filter
            ]);

            result[user.key] = {
                total,
                won,
                contacted,
                meeting,
                added: total, // Using total as added count for now since userWhere already filters by owner
                conversionRate: total > 0 ? Math.round((won / total) * 100) : 0
            };
        }));

        return result;
    },

    async getLeadsByState() {
        const leads = await prisma.lead.findMany({
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

        const users = [
            { key: 'joao', name: 'João', ids: ['21d216a4-e8c9-464d-b486-0b4db827f5ba'], names: ['joao', 'João Vitor'] },
            { key: 'bruno', name: 'Bruno', ids: ['0184fc53-a696-4ed6-b5e4-2391fd21b902'], names: ['bruno', 'Bruno'] },
            { key: 'nitz', name: 'Nitz', ids: ['1e83c3b1-b8ed-4a59-a37b-4425947525ea'], names: ['nitz', 'Nitz'] }
        ];

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
                prisma.lead.count({ where: { ...userWhere, last_contact_date: { gte: startOfDay } } }),
                prisma.lead.count({ where: { ...userWhere, last_contact_date: { gte: startOfWeek } } }),
                prisma.lead.count({ where: { ...userWhere, last_contact_date: { gte: startOfMonth } } }),
                prisma.lead.count({ where: { ...userWhere, status: 'MEETING', next_followup_date: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) } } }),
                prisma.lead.count({ where: { ...userWhere, status: 'MEETING' } }), // Simplifying week/month meetings to total current in meeting for scoreboard clarity or actual scheduled? keeping as existing logic implies active status
                prisma.lead.count({ where: { ...userWhere, status: 'MEETING' } }),
                prisma.lead.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfDay } } }),
                prisma.lead.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfWeek } } }),
                prisma.lead.count({ where: { ...userWhere, status: 'WON', last_contact_date: { gte: startOfMonth } } }),
                prisma.lead.count({ where: { ...userWhere, status: { notIn: ['WON', 'LOST'] } } }),
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
        const interactions = await prisma.interaction.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { lead: true }
        });

        // Define users map for resolution (Shared logic)
        const users = [
            { key: 'joao', name: 'João', ids: ['21d216a4-e8c9-464d-b486-0b4db827f5ba'], names: ['joao', 'João Vitor'] },
            { key: 'bruno', name: 'Bruno', ids: ['0184fc53-a696-4ed6-b5e4-2391fd21b902'], names: ['bruno', 'Bruno'] },
            { key: 'nitz', name: 'Nitz', ids: ['1e83c3b1-b8ed-4a59-a37b-4425947525ea'], names: ['nitz', 'Nitz'] }
        ];

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
                if (interaction.content.includes('WON') || interaction.content.includes('Venda')) {
                    type = 'conversion';
                    message = `${userName} fechou uma venda!`;
                    xp = 1000;
                } else {
                    type = 'lead';
                    message = `${userName} moveu um lead`;
                    xp = 25;
                }
            } else if (interaction.type === 'MEETING') {
                type = 'task';
                message = `${userName} agendou uma reunião`;
                xp = 300;
            } else if (['CALL', 'WHATSAPP', 'EMAIL'].includes(interaction.type)) {
                type = 'lead';
                message = `${userName} realizou um contato`;
                xp = 50;
            } else if (interaction.type === 'NOTE') {
                type = 'lead';
                message = `${userName} adicionou uma nota`;
                xp = 10;
            } else if (interaction.type === 'IMPORT') {
                type = 'lead';
                const count = interaction.content.split(':')[1] || 'vários';
                message = `${userName} importou ${count} leads`;
                xp = parseInt(count) * 10 || 50;
            } else if (interaction.type === 'CREATE') {
                type = 'lead';
                message = `${userName} adicionou um lead`;
                xp = 10;
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
    }
};
