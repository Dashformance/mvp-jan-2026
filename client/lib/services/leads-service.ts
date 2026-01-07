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
        // Use strict sanitizer
        const sanitized = LeadSanitizer.sanitizeForCreate(data);

        // Handle missing CNPJ for manual leads
        if (!sanitized.cnpj || sanitized.cnpj.trim() === '') {
            sanitized.cnpj = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        console.log('[LeadsService.create] Input data keys:', Object.keys(data));
        console.log('[LeadsService.create] Sanitized data:', JSON.stringify(sanitized, null, 2));

        return prisma.lead.create({
            data: sanitized,
        });
    },

    async createMany(leads: any[]) {
        const ops = leads.map((lead: any) => {
            const data = { ...lead, deletedAt: null };
            return prisma.lead.upsert({
                where: { cnpj: lead.cnpj },
                create: data as any,
                update: data as any,
            });
        });

        const results = await prisma.$transaction(ops);
        return { count: results.length };
    },

    async findAll(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [leads, total, joaoTotal, vitorTotal, unassignedTotal] = await Promise.all([
            prisma.lead.findMany({
                skip,
                take: Number(limit),
                where: { deletedAt: null },
                orderBy: { date_added: 'desc' },
            }),
            prisma.lead.count({ where: { deletedAt: null } }),
            prisma.lead.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
            prisma.lead.count({ where: { owner: 'vitor', deletedAt: null } }),
            prisma.lead.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
        ]);

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
    },

    async findOne(id: string) {
        return prisma.lead.findUnique({
            where: { id },
            include: { segment: true }
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

        return prisma.lead.update({
            where: { id },
            data: sanitizedData,
        });
    },

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

    async divideLeads(joaoCount: number, sourceOwner: 'unassigned' | 'joao' | 'vitor' | 'all' = 'unassigned') {
        const where: any = { deletedAt: null };
        if (sourceOwner === 'unassigned') {
            where.OR = [{ owner: null }, { owner: '' }];
        } else if (sourceOwner !== 'all') {
            where.owner = sourceOwner;
        }

        const leadsToDivide = await prisma.lead.findMany({
            where,
            select: { id: true },
            orderBy: { date_added: 'asc' }
        });

        if (leadsToDivide.length === 0) {
            return { joaoCount: 0, vitorCount: 0, total: 0 };
        }

        const ids = leadsToDivide.map((l: any) => l.id);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }

        const safeJoaoCount = Math.min(joaoCount, ids.length);
        const joaoIds = ids.slice(0, safeJoaoCount);
        const vitorIds = ids.slice(safeJoaoCount);

        if (joaoIds.length > 0) {
            await prisma.lead.updateMany({
                where: { id: { in: joaoIds } },
                data: { owner: 'joao' }
            });
        }

        if (vitorIds.length > 0) {
            await prisma.lead.updateMany({
                where: { id: { in: vitorIds } },
                data: { owner: 'vitor' }
            });
        }

        return {
            joaoCount: joaoIds.length,
            vitorCount: vitorIds.length,
            total: ids.length
        };
    },

    async getStatsOverview() {
        const [total, byStatus, byOwner, addedToday, addedThisWeek, addedThisMonth] = await Promise.all([
            prisma.lead.count({ where: { deletedAt: null } }),
            prisma.lead.groupBy({
                by: ['status'],
                where: { deletedAt: null },
                _count: { status: true }
            }),
            prisma.lead.groupBy({
                by: ['owner'],
                where: { deletedAt: null },
                _count: { owner: true }
            }),
            prisma.lead.count({
                where: {
                    deletedAt: null,
                    date_added: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            }),
            prisma.lead.count({
                where: {
                    deletedAt: null,
                    date_added: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.lead.count({
                where: {
                    deletedAt: null,
                    date_added: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
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
            addedThisMonth
        };
    },

    async getConversionFunnel() {
        const statuses = ['INBOX', 'NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'LOST', 'DISQUALIFIED'];
        const counts = await prisma.lead.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { status: true }
        });

        const countMap: Record<string, number> = {};
        counts.forEach((c: any) => { countMap[c.status] = c._count.status; });
        const total = Object.values(countMap).reduce((a: number, b: number) => a + b, 0);

        return statuses.map(status => ({
            status,
            count: countMap[status] || 0,
            percentage: total > 0 ? Math.round(((countMap[status] || 0) / total) * 100) : 0
        }));
    },

    async getTimelineStats(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const leads = await prisma.lead.findMany({
            where: {
                deletedAt: null,
                date_added: { gte: startDate }
            },
            select: { date_added: true, status: true }
        });

        const byDate: Record<string, { added: number, won: number }> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = date.toISOString().split('T')[0];
            byDate[key] = { added: 0, won: 0 };
        }

        leads.forEach((lead: any) => {
            const key = lead.date_added.toISOString().split('T')[0];
            if (byDate[key]) {
                byDate[key].added++;
                if (lead.status === 'WON') byDate[key].won++;
            }
        });

        return Object.entries(byDate)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    async getPerformanceByOwner() {
        const [byOwnerStatus, totalByOwner] = await Promise.all([
            prisma.lead.groupBy({
                by: ['owner', 'status'],
                where: { deletedAt: null },
                _count: { id: true }
            }),
            prisma.lead.groupBy({
                by: ['owner'],
                where: { deletedAt: null },
                _count: { id: true }
            })
        ]);

        const owners = ['joao', 'vitor'];
        const result: Record<string, any> = {};

        owners.forEach((owner: string) => {
            const ownerData = byOwnerStatus.filter((d: any) => d.owner === owner);
            const total = totalByOwner.find((t: any) => t.owner === owner)?._count.id || 0;
            const won = ownerData.find((d: any) => d.status === 'WON')?._count.id || 0;
            const contacted = ownerData.find((d: any) => d.status === 'CONTACTED')?._count.id || 0;
            const meeting = ownerData.find((d: any) => d.status === 'MEETING')?._count.id || 0;

            result[owner] = {
                total,
                won,
                contacted,
                meeting,
                conversionRate: total > 0 ? Math.round((won / total) * 100) : 0
            };
        });
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

        const owners = ['joao', 'vitor'];
        const result: Record<string, any> = {};

        for (const owner of owners) {
            const [
                contactedToday, contactedWeek, contactedMonth,
                meetingsToday, meetingsWeek, meetingsMonth,
                wonToday, wonWeek, wonMonth,
                totalActive
            ] = await Promise.all([
                prisma.lead.count({ where: { owner, deletedAt: null, last_contact_date: { gte: startOfDay } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, last_contact_date: { gte: startOfWeek } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, last_contact_date: { gte: startOfMonth } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'MEETING', next_followup_date: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'MEETING' } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'MEETING' } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'WON', last_contact_date: { gte: startOfDay } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'WON', last_contact_date: { gte: startOfWeek } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: 'WON', last_contact_date: { gte: startOfMonth } } }),
                prisma.lead.count({ where: { owner, deletedAt: null, status: { notIn: ['WON', 'LOST'] } } }),
            ]);

            result[owner] = {
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
        }
        return result;
    }
};
