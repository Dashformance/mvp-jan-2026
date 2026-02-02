import { prisma } from '@/lib/prisma';
import { ACTION_POINTS } from '../gamification/config';

export interface StepMapping {
    status: string;
    step: number;
    label: string;
    phase: string;
    isWin?: boolean;
    isLost?: boolean;
}

export class AnalyticsService {
    /**
     * Helper for score calculation
     */
    static calculateScore(lead: any): number {
        let score = 0;
        if (lead.email && lead.email.trim().length > 5) score += 10;
        if (lead.phone && lead.phone.replace(/[^0-9]/g, '').length >= 8) score += 10;
        if (lead.decision_maker) score += 10;
        if (lead.linkedin_url || lead.website) score += 5;

        if (lead.checklist) {
            const checklist = typeof lead.checklist === 'string' ? JSON.parse(lead.checklist) : lead.checklist;
            if (checklist.hasInstagram) score += 20;
            if (checklist.hasRender) score += 20;
        }
        return score;
    }

    /**
     * Helper for XP calculation per interaction
     */
    static getInteractionXP(int: any): number {
        let xp = 0;
        if (int.type === 'STATUS_CHANGE' || int.type === 'MOVETO') {
            if (int.content.includes('WON') || int.content.includes('SOLD')) xp = ACTION_POINTS.LEAD_CONVERTED;
            else if (int.content.includes('MEETING') || int.content.includes('AGENDADA')) xp = ACTION_POINTS.LEAD_QUALIFIED;
            else if (int.content.includes('CONTACTED')) xp = ACTION_POINTS.LEAD_CONTACTED;
            else xp = 10;
        }
        else if (int.type === 'MEETING' || int.type === 'QUALIFY') xp = ACTION_POINTS.LEAD_QUALIFIED;
        else if (['CALL', 'WHATSAPP', 'EMAIL', 'CONTACT'].includes(int.type)) xp = ACTION_POINTS.LEAD_CONTACTED;
        else if (int.type === 'CREATE') xp = ACTION_POINTS.LEAD_CREATED;
        else if (int.type === 'IMPORT') {
            const count = parseInt(int.content.split(':')[1]) || 1;
            xp = count * ACTION_POINTS.BULK_IMPORT;
        }
        else if (int.type === 'NOTE') xp = 10;
        return xp;
    }

    /**
     * Fetch all relevant users for dashboard display and performance tracking
     */
    static async getDashboardUsers() {
        const users = await prisma.user.findMany();
        return users.map(u => ({
            key: u.email.split('@')[0].toLowerCase(),
            name: u.name,
            id: u.id,
            avatar: u.avatar_url,
            role: u.role,
            xp: u.xp,
            level: u.level,
            ids: [u.id, u.supabase_uid].filter(Boolean),
            names: [u.name, u.email, u.name.toLowerCase()].filter(Boolean),
            gamification: u.gamification
        }));
    }

    /**
     * Maps database statuses to logical Steps (1-5+) based on their position.
     */
    static async getStepMapping(): Promise<Record<string, StepMapping>> {
        const stages = await prisma.stages.findMany({
            orderBy: { position: 'asc' }
        });

        const mapping: Record<string, StepMapping> = {
            'INBOX': { status: 'INBOX', step: 0, label: 'Inbox', phase: 'Entrada' }
        };

        stages.forEach((stage: any) => {
            mapping[stage.name] = {
                status: stage.name,
                step: stage.position,
                label: stage.phase || stage.name,
                phase: stage.phase,
                isWin: stage.is_win_stage,
                isLost: stage.is_lost_stage
            };
        });

        return mapping;
    }

    /**
     * Stats Overview for the main dashboard
     */
    static async getStatsOverview(ownerId?: string, minDate?: Date, maxDate?: Date) {
        const baseWhere: any = { deletedAt: null };
        if (ownerId) {
            baseWhere.OR = [{ owner_id: ownerId }, { owner_id: null }];
        }
        if (minDate) baseWhere.date_added = { gte: minDate };
        if (maxDate) {
            if (!baseWhere.date_added) baseWhere.date_added = {};
            baseWhere.date_added.lte = maxDate;
        }

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
                where: { ...baseWhere, date_added: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
            }),
            prisma.leads.count({
                where: { ...baseWhere, date_added: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            }),
            prisma.leads.count({
                where: { ...baseWhere, date_added: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            }),
            prisma.leads.aggregate({
                where: { ...baseWhere, status: 'SOLD' },
                _sum: { contract_value: true }
            }),
            prisma.leads.aggregate({
                where: { ...baseWhere, status: { in: ['MEETING', 'WON'] } },
                _sum: { contract_value: true }
            }),
            prisma.leads.aggregate({
                where: { ...baseWhere, status: { in: ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON'] } },
                _sum: { contract_value: true }
            })
        ]);

        const statusCounts: Record<string, number> = {};
        byStatus.forEach((s: any) => { statusCounts[s.status] = s._count.status; });

        const ownerCounts: Record<string, number> = {};
        byOwner.forEach((o: any) => { ownerCounts[o.owner || 'unassigned'] = o._count.owner; });

        // Calculate period-specific totals for KPI cards
        const totalMeetings = statusCounts['MEETING'] || 0;
        const totalContacts = (statusCounts['CONTACTED'] || 0) + (statusCounts['MEETING'] || 0) + (statusCounts['WON'] || 0) + (statusCounts['SOLD'] || 0);
        const totalSales = (statusCounts['WON'] || 0) + (statusCounts['SOLD'] || 0);

        return {
            total,
            byStatus: statusCounts,
            byOwner: ownerCounts,
            addedToday,
            addedThisWeek,
            addedThisMonth,
            revenue: revenueStats._sum.contract_value ? Number(revenueStats._sum.contract_value.toString()) : 0,
            moneyOnTable: pipelineStats._sum.contract_value ? Number(pipelineStats._sum.contract_value.toString()) : 0,
            pipelineValue: broadPipelineStats?._sum?.contract_value ? Number(broadPipelineStats._sum.contract_value.toString()) : 0,
            totalMeetings,
            totalContacts,
            totalSales
        };
    }

    /**
     * Upcoming Meetings/Follow-ups
     */
    static async getUpcomingMeetings(limit = 10) {
        const meetings = await prisma.leads.findMany({
            where: {
                deletedAt: null,
                next_followup_date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            },
            take: limit,
            orderBy: { next_followup_date: 'asc' },
            select: {
                id: true,
                company_name: true,
                trade_name: true,
                next_followup_date: true,
                owner: true,
                meeting_type: true,
                meeting_status: true,
                status: true,
                notes: true,
                User: { select: { name: true, avatar_url: true } }
            }
        });

        return meetings.map((m: any) => ({
            id: m.id,
            title: m.trade_name || m.company_name || 'Lead sem nome',
            date: m.next_followup_date,
            ownerName: m.User?.name || m.owner || 'N/A',
            ownerAvatar: m.User?.avatar_url,
            meeting_type: m.meeting_type || 'SCHEDULED',
            meeting_status: m.meeting_status || 'PENDING',
            lead_status: m.status,
            notes: m.notes
        }));
    }

    /**
     * Sales Funnel visualization data
     */
    static async getConversionFunnel(minDate?: Date, maxDate?: Date) {
        const statuses = ['INBOX', 'NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'SOLD', 'LOST', 'DISQUALIFIED'];
        const users = await this.getDashboardUsers();

        const whereClause: any = { deletedAt: null };
        if (minDate) whereClause.date_added = { gte: minDate };
        if (maxDate) {
            if (!whereClause.date_added) whereClause.date_added = {};
            whereClause.date_added.lte = maxDate;
        }

        const counts = await prisma.leads.groupBy({
            by: ['status', 'owner_id', 'owner'],
            where: whereClause,
            _count: { _all: true }
        });

        const map: Record<string, any> = {};
        statuses.forEach(s => {
            map[s] = { total: 0 };
            users.forEach(u => map[s][u.key] = 0);
        });

        let grandTotal = 0;
        counts.forEach(item => {
            const s = item.status;
            if (!map[s]) return;
            const count = item._count._all;
            map[s].total += count;
            grandTotal += count;

            for (const user of users) {
                const isOwner = (item.owner_id && user.ids.includes(item.owner_id)) ||
                    (item.owner && user.names.some(n => n.toLowerCase() === item.owner?.toLowerCase()));

                if (isOwner) {
                    map[s][user.key] += count;
                    break;
                }
            }
        });

        return statuses.map(status => {
            const entry: any = {
                status,
                count: map[status].total,
                percentage: grandTotal > 0 ? Math.round((map[status].total / grandTotal) * 100) : 0
            };
            users.forEach(u => { entry[u.key] = map[status][u.key]; });
            return entry;
        });
    }

    /**
     * Timeline of activity and status changes
     */
    static async getTimelineStats(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [addedLeads, interactions] = await Promise.all([
            prisma.leads.findMany({
                where: { deletedAt: null, date_added: { gte: startDate } },
                select: { date_added: true }
            }),
            prisma.interactions.findMany({
                where: { date: { gte: startDate } },
                select: { date: true, type: true, content: true }
            })
        ]);

        const byDate: Record<string, any> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = date.toISOString().split('T')[0];
            byDate[key] = { date: key, added: 0, contacted: 0, scheduled: 0 };
        }

        addedLeads.forEach((lead: any) => {
            const key = lead.date_added.toISOString().split('T')[0];
            if (byDate[key]) byDate[key].added++;
        });

        interactions.forEach((int: any) => {
            const key = int.date.toISOString().split('T')[0];
            if (!byDate[key]) return;

            if (['CALL', 'EMAIL', 'WHATSAPP'].includes(int.type)) byDate[key].contacted++;
            else if (int.type === 'MEETING') byDate[key].scheduled++;
            else if (int.type === 'STATUS_CHANGE') {
                let status = null;
                if (int.content.startsWith('MOVETO:')) status = int.content.split(':')[1];
                else {
                    const match = int.content.match(/para\s+([A-Z_]+)/i);
                    if (match) status = match[1];
                }
                if (status) {
                    const statusKey = status.toUpperCase();
                    byDate[key][statusKey] = (byDate[key][statusKey] || 0) + 1;
                }
            }
        });

        const allKeys = new Set<string>(['added', 'contacted', 'scheduled']);
        const values = Object.values(byDate);
        values.forEach((v: any) => Object.keys(v).forEach(k => allKeys.add(k)));

        return values.map((v: any) => {
            const entry = { ...v };
            allKeys.forEach(k => { if (entry[k] === undefined) entry[k] = 0; });
            return entry;
        }).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }

    /**
     * Detailed performance by team member (PlayerCard logic)
     */
    static async getPerformanceByOwner(minDate?: Date, maxDate?: Date) {
        const users = await this.getDashboardUsers();
        const mapping = await this.getStepMapping();
        const todayReset = new Date();
        todayReset.setHours(0, 0, 0, 0);

        const velocityCutoff = new Date();
        velocityCutoff.setDate(velocityCutoff.getDate() - 5);

        // Batch queries for all relevant users
        const allUserIds = users.flatMap(u => u.ids);
        const allUserNames = users.flatMap(u => u.names);

        const [allStatusCounts, allRevenue, allVelocityLeadsCounts, allTodayInts, allPeriodInts, allVelocityInts, allPeriodLeadsAdded] = await Promise.all([
            // 1. Status counts for all users
            prisma.leads.groupBy({
                by: ['owner_id', 'owner', 'status'],
                where: { deletedAt: null, OR: [{ owner_id: { in: allUserIds } }, { owner: { in: allUserNames } }] },
                _count: { _all: true }
            }),
            // 2. Revenue for all users
            prisma.leads.groupBy({
                by: ['owner_id', 'owner'],
                where: { deletedAt: null, status: { in: ['WON', 'SOLD'] }, OR: [{ owner_id: { in: allUserIds } }, { owner: { in: allUserNames } }] },
                _sum: { contract_value: true }
            }),
            // 3. Velocity leads (added in last 5 days)
            prisma.leads.groupBy({
                by: ['owner_id', 'owner'],
                where: { deletedAt: null, date_added: { gte: velocityCutoff }, OR: [{ owner_id: { in: allUserIds } }, { owner: { in: allUserNames } }] },
                _count: { _all: true }
            }),
            // 4. Today's interactions for XP
            prisma.interactions.findMany({
                where: {
                    date: { gte: todayReset },
                    OR: [{ user_id: { in: allUserIds } }, { user_id: { in: (allUserNames as any) } }]
                }
            }),
            // 5. Period's interactions for XP and Stats
            prisma.interactions.findMany({
                where: {
                    ...(minDate || maxDate ? { date: { ...(minDate ? { gte: minDate } : {}), ...(maxDate ? { lte: maxDate } : {}) } } : {}),
                    OR: [{ user_id: { in: allUserIds } }, { user_id: { in: (allUserNames as any) } }]
                },
                include: { leads: { select: { contract_value: true } } }
            }),
            // 6. Velocity interactions
            prisma.interactions.groupBy({
                by: ['user_id'],
                where: { date: { gte: velocityCutoff }, OR: [{ user_id: { in: allUserIds } }, { user_id: { in: (allUserNames as any) } }] },
                _count: { _all: true }
            }),
            // 7. Period Added Leads (For "Leads" Metric)
            prisma.leads.groupBy({
                by: ['owner_id', 'owner'],
                where: {
                    deletedAt: null,
                    ...(minDate || maxDate ? { date_added: { ...(minDate ? { gte: minDate } : {}), ...(maxDate ? { lte: maxDate } : {}) } } : {}),
                    OR: [{ owner_id: { in: allUserIds } }, { owner: { in: (allUserNames as any) } }]
                },
                _count: { _all: true }
            })
        ]);


        const result: Record<string, any> = {};

        // Process in-memory for each user
        users.forEach(user => {
            const isUserMatch = (id?: string | null, name?: string | null) => {
                if (id && user.ids.includes(id)) return true;
                if (name && user.names.some(n => n.toLowerCase() === name.toLowerCase())) return true;
                return false;
            };

            // Aggregate status counts
            let totalActive = 0;
            let totalResp = 0;
            let totalMeet = 0;
            let totalSold = 0;

            allStatusCounts.forEach(s => {
                if (isUserMatch(s.owner_id, s.owner)) {
                    const m = mapping[s.status] || mapping['INBOX'];
                    const count = s._count._all;

                    if (m.step > 0) totalActive += count;
                    if (m.step >= 2) totalResp += count;
                    if (m.step >= 4) totalMeet += count;
                    if (m.isWin) totalSold += count;
                }
            });

            // Aggregate Revenue
            let totalRevenue = 0;
            allRevenue.forEach(r => {
                if (isUserMatch(r.owner_id, r.owner)) {
                    totalRevenue += Number(r._sum.contract_value || 0);
                }
            });

            // Aggregate Velocity
            let velocityAdded = 0;
            allVelocityLeadsCounts.forEach(v => {
                if (isUserMatch(v.owner_id, v.owner)) {
                    velocityAdded += v._count._all;
                }
            });

            let velocityInts = 0;
            allVelocityInts.forEach(v => {
                if (v.user_id && (user.ids.includes(v.user_id) || user.names.some(n => n.toLowerCase() === v.user_id?.toLowerCase()))) {
                    velocityInts += v._count._all;
                }
            });

            // --- PERIOD STATS (Activity & Flow) ---
            // Leads Added in Period (From Leads Table)
            let periodAdded = 0;
            allPeriodLeadsAdded.forEach(a => {
                if (isUserMatch(a.owner_id, a.owner)) {
                    periodAdded += a._count._all;
                }
            });

            // Interactions in Period (From Interactions Table)
            const userPeriodInts = allPeriodInts.filter(i =>
                i.user_id && (user.ids.includes(i.user_id) || user.names.some(n => n.toLowerCase() === i.user_id?.toLowerCase()))
            );

            // Contacts: Calls, Emails, Whatsapp, etc.
            const periodContacts = userPeriodInts.filter(i => ['CALL', 'EMAIL', 'WHATSAPP', 'CONTACT'].includes(i.type)).length;

            // Meetings: Type MEETING
            const periodMeetings = userPeriodInts.filter(i => i.type === 'MEETING').length;

            // Sales: Status Change to WON/SOLD
            const salesEvents = userPeriodInts.filter(i => i.type === 'STATUS_CHANGE' && (i.content.includes('WON') || i.content.includes('SOLD')));
            const periodSold = salesEvents.length;

            // Revenue: Sum of contract_value from sales events
            const periodRevenue = salesEvents.reduce((acc, curr) => {
                const val = curr.leads?.contract_value ? Number(curr.leads.contract_value) : 0;
                return acc + val;
            }, 0);

            // Velocity (Recent 5 days) - Kept for internal logic if needed, but Card Score largely depends on Period now

            // XP Calculation (Keep existing logic)
            const xpToday = allTodayInts
                .filter(i => i.user_id && (user.ids.includes(i.user_id) || user.names.some(n => n.toLowerCase() === i.user_id?.toLowerCase())))
                .reduce((acc, i) => acc + this.getInteractionXP(i), 0);

            const xpPeriod = userPeriodInts.reduce((acc, i) => acc + this.getInteractionXP(i), 0);

            // --- SCORES (Period Based) ---
            // Adjusted weights for Flow Metrics vs Snapshot
            // Sales: 150 pts
            // Meetings: 30 pts
            // Contacts: 5 pts (was 10 for "Resp", but contacts are more frequent)
            // Added: 2 pts
            // Revenue: 1 pt per 500 BRL

            const qualityScore = (periodSold * 150) + (periodMeetings * 30) + (periodContacts * 5) + (periodAdded * 2);
            // We can still add a small bonus for Total Active Pipeline size (Snapshot) to reward having a big pipeline
            const pipelineBonus = Math.floor(totalActive * 0.5);

            const revenueScore = (periodRevenue / 500);

            // Normalized Score (Target approx 100 for a good month)
            // Example Good Month: 5 Sales (750), 20 Meetings (600), 100 Contacts (500), 50 Added (100) = ~2000 raw points
            // Revenue 50k / 500 = 100 pts.
            // Total ~2100.
            // Map to 0-99 scale. 2000 points = 99?
            const rawScore = qualityScore + revenueScore + pipelineBonus;
            const calcScore = Math.min(Math.round((rawScore / 30)), 99); // Div by 30 roughly maps 3000 -> 100

            result[user.key] = {
                // Snapshot Stats (Legacy / Secondary)
                total: totalActive,
                lifetimeTotal: totalActive,
                lifetimeResp: totalResp,
                lifetimeMeet: totalMeet,
                lifetimeSold: totalSold,

                // Period Stats (Primary for Card)
                addedToday: periodAdded, // Mapping "addedToday" to periodAdded for card display if used
                won: periodSold,
                contacted: periodContacts,
                meeting: periodMeetings,
                revenue: periodRevenue, // Period Revenue

                // Ratios
                conversionRate: periodAdded > 0 ? Math.round((periodSold / periodAdded) * 100) : 0,

                xpToday,
                xpPeriod,
                score: Math.max(calcScore, 1), // Minimum 1
                meta: { id: user.id, name: user.name, avatar: user.avatar, role: user.role, xp: user.xp, level: user.level, gamification: user.gamification }
            };
        });

        return result;
    }

    /**
     * Geographical distribution of leads
     */
    static async getLeadsByState() {
        const counts = await prisma.leads.groupBy({
            by: ['uf'],
            where: { deletedAt: null },
            _count: { _all: true }
        });

        const regionStates: Record<string, string[]> = {
            'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
            'Sul': ['PR', 'SC', 'RS'],
            'Nordeste': ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI'],
            'Centro-Oeste': ['GO', 'MT', 'MS', 'DF'],
            'Norte': ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
        };
        const regionData: Record<string, number> = { 'Sudeste': 0, 'Sul': 0, 'Nordeste': 0, 'Centro-Oeste': 0, 'Norte': 0, 'Sem UF': 0 };
        let totalCount = 0;

        counts.forEach((item) => {
            const count = item._count._all;
            totalCount += count;
            const uf = item.uf?.toUpperCase();

            if (uf) {
                let found = false;
                for (const [region, states] of Object.entries(regionStates)) {
                    if (states.includes(uf)) { regionData[region] += count; found = true; break; }
                }
                if (!found) regionData['Sem UF'] += count;
            } else {
                regionData['Sem UF'] += count;
            }
        });

        return { byRegion: regionData, total: totalCount };
    }

    /**
     * Sales force activity summary
     */
    static async getSalesForce() {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 86400000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const users = await this.getDashboardUsers();
        const allUserIds = users.flatMap(u => u.ids);
        const allUserNames = users.flatMap(u => u.names);

        const userFilter = {
            OR: [
                { owner_id: { in: allUserIds } },
                { owner: { in: (allUserNames as any) } }
            ]
        };

        const [allContacted, allMeetings, allWon, allActive] = await Promise.all([
            // 1. Contacted in the month (covering day and week)
            prisma.leads.findMany({
                where: { ...userFilter, deletedAt: null, last_contact_date: { gte: startOfMonth } },
                select: { owner_id: true, owner: true, last_contact_date: true }
            }),
            // 2. Meetings
            prisma.leads.findMany({
                where: { ...userFilter, deletedAt: null, status: 'MEETING' },
                select: { owner_id: true, owner: true, next_followup_date: true }
            }),
            // 3. Won (covering day, week, month)
            prisma.leads.findMany({
                where: { ...userFilter, deletedAt: null, status: { in: ['WON', 'SOLD'] }, last_contact_date: { gte: startOfMonth } },
                select: { owner_id: true, owner: true, last_contact_date: true }
            }),
            // 4. Total Active
            prisma.leads.groupBy({
                by: ['owner_id', 'owner'],
                where: { ...userFilter, deletedAt: null, status: { notIn: ['WON', 'SOLD', 'LOST', 'DISQUALIFIED'] } },
                _count: { _all: true }
            })
        ]);

        const result: Record<string, any> = {};

        users.forEach(user => {
            const isOwner = (id?: string | null, name?: string | null) => {
                if (id && user.ids.includes(id)) return true;
                if (name && user.names.some(n => n.toLowerCase() === name.toLowerCase())) return true;
                return false;
            };

            const userContacted = allContacted.filter(l => isOwner(l.owner_id, l.owner));
            const userMeetings = allMeetings.filter(l => isOwner(l.owner_id, l.owner));
            const userWon = allWon.filter(l => isOwner(l.owner_id, l.owner));
            const userActive = allActive.filter(l => isOwner(l.owner_id, l.owner)).reduce((acc, curr) => acc + curr._count._all, 0);

            const cToday = userContacted.filter(l => l.last_contact_date && l.last_contact_date >= startOfDay).length;
            const cWeek = userContacted.filter(l => l.last_contact_date && l.last_contact_date >= startOfWeek).length;
            const cMonth = userContacted.length;

            const mToday = userMeetings.filter(l => l.next_followup_date && new Date(l.next_followup_date).setHours(0, 0, 0, 0) === startOfDay.getTime()).length;
            const mTotal = userMeetings.length;

            const wToday = userWon.filter(l => l.last_contact_date && l.last_contact_date >= startOfDay).length;
            const wWeek = userWon.filter(l => l.last_contact_date && l.last_contact_date >= startOfWeek).length;
            const wMonth = userWon.length;

            result[user.key] = {
                today: { contacted: cToday, meetings: mToday, won: wToday },
                week: { contacted: cWeek, meetings: mTotal, won: wWeek },
                month: { contacted: cMonth, meetings: mTotal, won: wMonth },
                totalActive: userActive,
                score: {
                    today: cToday + mToday * 3 + wToday * 10,
                    week: cWeek + mTotal * 3 + wWeek * 10,
                    month: cMonth + mTotal * 3 + wMonth * 10
                }
            };
        });

        return result;
    }

    /**
     * Recent activities with XP and friendly messages
     */
    static async getRecentActivity(limit = 15) {
        const interactions = await prisma.interactions.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { leads: true }
        });

        const users = await this.getDashboardUsers();

        return interactions.map((interaction: any) => {
            let type: 'conversion' | 'task' | 'streak' | 'lead' = 'task';
            let message = '';
            const xp = this.getInteractionXP(interaction);

            let userName = 'Consultor';
            const user = users.find(u => u.ids.includes(interaction.user_id) || u.names.some(n => n.toLowerCase() === (interaction.user_id || '').toLowerCase()));
            if (user) userName = user.name;
            else if (interaction.user_id && interaction.user_id !== 'system') userName = interaction.user_id;

            if (interaction.type === 'STATUS_CHANGE') {
                if (interaction.content.includes('WON') || interaction.content.includes('SOLD')) {
                    type = 'conversion';
                    message = `${userName} fechou uma venda!`;
                } else {
                    type = 'lead';
                    message = `${userName} moveu um lead`;
                }
            } else if (interaction.type === 'MEETING') { message = `${userName} agendou uma reunião`; }
            else if (['CALL', 'WHATSAPP', 'EMAIL'].includes(interaction.type)) { type = 'lead'; message = `${userName} realizou um contato`; }
            else if (interaction.type === 'IMPORT') {
                const count = interaction.content.split(':')[1] || 'vários';
                message = `${userName} importou ${count} leads`;
            } else if (interaction.type === 'CREATE') { message = `${userName} adicionou um lead`; }

            if (!message && interaction.content) message = interaction.content.substring(0, 50);

            return { id: interaction.id, message, xp, timestamp: interaction.date, type, userName };
        });
    }

    /**
     * Legacy performance report based on steps
     */
    static async getPerformanceReport(userId?: string, startDate?: Date, endDate?: Date) {
        const mapping = await this.getStepMapping();
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const baseWhereLeads: any = { deletedAt: null };
        if (userId) baseWhereLeads.owner_id = userId;

        const baseWhereInteractions: any = { date: { gte: start, lte: end } };
        if (userId) baseWhereInteractions.user_id = userId;

        const leads = await prisma.leads.findMany({ where: baseWhereLeads, select: { status: true, contract_value: true } });
        const snapshot: Record<number, { count: number, value: number, label: string }> = {};
        Object.values(mapping).forEach(m => { snapshot[m.step] = { count: 0, value: 0, label: m.label }; });

        leads.forEach(l => {
            const m = mapping[l.status] || mapping['INBOX'];
            if (!snapshot[m.step]) snapshot[m.step] = { count: 0, value: 0, label: m.label || l.status };
            snapshot[m.step].count++;
            snapshot[m.step].value += Number(l.contract_value || 0);
        });

        const interactions = await prisma.interactions.findMany({ where: { ...baseWhereInteractions, type: 'STATUS_CHANGE' }, orderBy: { date: 'asc' } });
        const flow = { forward: 0, backward: 0, conversions: interactions.length, stepTransitions: [] as any[] };

        interactions.forEach(i => {
            const targetStatus = i.content.replace('MOVETO:', '');
            const m = mapping[targetStatus];
            if (m) flow.stepTransitions.push({ date: i.date, toStep: m.step, label: m.label, userId: i.user_id });
        });

        const activities = await prisma.interactions.count({ where: { ...baseWhereInteractions, type: { in: ['WHATSAPP', 'EMAIL', 'CALL', 'MEETING'] } } });

        return { period: { start, end }, mapping, snapshot, flow, activities };
    }

    /**
     * Activity trend over time (Hourly or Daily)
     */
    static async getActivityTrend(startDate: Date, endDate: Date, ownerId?: string) {
        const [interactions, newLeads] = await Promise.all([
            prisma.interactions.findMany({ where: { date: { gte: startDate, lte: endDate }, ...(ownerId ? { user_id: ownerId } : {}) }, select: { date: true, type: true, content: true } }),
            prisma.leads.findMany({ where: { date_added: { gte: startDate, lte: endDate }, deletedAt: null, ...(ownerId ? { owner_id: ownerId } : {}) }, select: { date_added: true } })
        ]);

        const diffDays = (endDate.getTime() - startDate.getTime()) / 86400000;
        if (diffDays <= 1.1) {
            const hourlyData = Array.from({ length: 24 }, (_, i) => ({ label: `${i.toString().padStart(2, '0')}:00`, added: 0, contacts: 0, messages: 0, meetings: 0 }));
            newLeads.forEach(l => hourlyData[l.date_added.getHours()].added++);
            interactions.forEach(i => {
                const hour = new Date(i.date).getHours();
                if (['CALL', 'EMAIL', 'CONTACT'].includes(i.type)) hourlyData[hour].contacts++;
                else if (i.type === 'WHATSAPP') hourlyData[hour].messages++;
                else if (i.type === 'MEETING' || i.content.includes('MEETING')) hourlyData[hour].meetings++;
            });
            return hourlyData;
        } else {
            const dailyMap = new Map<string, any>();
            let c = new Date(startDate);
            while (c <= endDate) {
                const k = c.toISOString().split('T')[0];
                dailyMap.set(k, { label: k, added: 0, contacts: 0, messages: 0, meetings: 0 });
                c.setDate(c.getDate() + 1);
            }
            newLeads.forEach(l => { const k = l.date_added.toISOString().split('T')[0]; if (dailyMap.has(k)) dailyMap.get(k).added++; });
            interactions.forEach(i => {
                const k = new Date(i.date).toISOString().split('T')[0];
                if (dailyMap.has(k)) {
                    const e = dailyMap.get(k);
                    if (['CALL', 'EMAIL', 'CONTACT'].includes(i.type)) e.contacts++;
                    else if (i.type === 'WHATSAPP') e.messages++;
                    else if (i.type === 'MEETING' || i.content.includes('MEETING')) e.meetings++;
                }
            });
            return Array.from(dailyMap.values()).sort((a, b) => a.label.localeCompare(b.label));
        }
    }
}
