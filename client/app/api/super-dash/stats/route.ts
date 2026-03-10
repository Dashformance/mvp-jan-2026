import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // PARSE QUERY PARAMS (Sprint 11)
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'today';
        const customStart = searchParams.get('startDate');
        const customEnd = searchParams.get('endDate');

        // SUPERDASH CONFIG
        // DEFINING SEASON START based on Period
        let SEASON_START_DATE = new Date();
        let SEASON_END_DATE: Date | undefined = undefined;

        const now = new Date();
        now.setHours(23, 59, 59, 999); // End of today

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today

        switch (period) {
            case 'today':
                SEASON_START_DATE = todayStart;
                break;
            case 'week':
                // Semana começa na segunda-feira
                const dayOfWeek = now.getDay();
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // domingo = 6 dias atrás
                const monday = new Date(now);
                monday.setDate(now.getDate() - diffToMonday);
                monday.setHours(0, 0, 0, 0);
                SEASON_START_DATE = monday;

                // Fim da semana = domingo às 23:59
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);
                SEASON_END_DATE = sunday;
                break;
            case 'last-week':
                // Semana Passada (Segunda a Domingo anteriores)
                const currentDayOfWeek = now.getDay();
                const diffToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

                const currentMonday = new Date(now);
                currentMonday.setDate(now.getDate() - diffToCurrentMonday);

                const lastWeekMonday = new Date(currentMonday);
                lastWeekMonday.setDate(currentMonday.getDate() - 7);
                lastWeekMonday.setHours(0, 0, 0, 0);
                SEASON_START_DATE = lastWeekMonday;

                const lastWeekSunday = new Date(lastWeekMonday);
                lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
                lastWeekSunday.setHours(23, 59, 59, 999);
                SEASON_END_DATE = lastWeekSunday;
                break;
            case 'month':
                // Mês Atual (MTD)
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                firstDay.setHours(0, 0, 0, 0);
                SEASON_START_DATE = firstDay;
                // SEASON_END_DATE = undefined -> Até agora
                break;
            case 'total':
                SEASON_START_DATE = new Date('2026-01-06T00:00:00-03:00');
                break;
            case 'custom':
                if (customStart) {
                    SEASON_START_DATE = new Date(customStart);
                } else {
                    SEASON_START_DATE = todayStart;
                }
                if (customEnd) {
                    SEASON_END_DATE = new Date(customEnd);
                    SEASON_END_DATE.setHours(23, 59, 59, 999);
                }
                break;
            default:
                SEASON_START_DATE = new Date('2025-01-01T00:00:00-03:00');
                break;
        }

        const seasonStartString = SEASON_START_DATE instanceof Date && !isNaN(SEASON_START_DATE.getTime())
            ? SEASON_START_DATE.toISOString()
            : 'Invalid Date';
        console.log(`[SuperDash API] Fetching stats for period: ${period}. Start: ${seasonStartString}`);

        // 1. Fetch ALL DATA in parallel for maximum performance
        let funnel: any[] = [];
        let seasonalStats: any = {};
        let regionDistribution: any = [];
        let globalStats: any = { revenue: 0, pipelineValue: 0, moneyOnTable: 0 };
        let calendar: any[] = [];
        let feed: any[] = [];
        let hourlyActions: any[] = [];

        try {
            const results = await Promise.all([
                AnalyticsService.getConversionFunnel(SEASON_START_DATE).catch(e => { console.error('Funnel error:', e); return []; }),
                AnalyticsService.getPerformanceByOwner(SEASON_START_DATE, SEASON_END_DATE).catch(e => { console.error('Seasonal stats error:', e); return {}; }),
                AnalyticsService.getLeadsByState().catch(e => { console.error('Regions error:', e); return []; }),
                AnalyticsService.getStatsOverview(undefined, SEASON_START_DATE, SEASON_END_DATE).catch(e => { console.error('Overview stats error:', e); return { revenue: 0, pipelineValue: 0, moneyOnTable: 0 }; }),
                AnalyticsService.getUpcomingMeetings(100).catch(e => { console.error('Calendar error:', e); return []; }),
                AnalyticsService.getRecentActivity(20).catch(e => { console.error('Feed error:', e); return []; }),
                (period === 'today'
                    ? AnalyticsService.getActivityTrend(todayStart, now)
                    : AnalyticsService.getActivityTrend(SEASON_START_DATE, SEASON_END_DATE || now)
                ).catch(e => { console.error('Trend error:', e); return []; })
            ]);
            [funnel, seasonalStats, regionDistribution, globalStats, calendar, feed, hourlyActions] = results;
        } catch (err) {
            console.error('[SuperDash API] Critical Promise.all failure:', err);
        }

        // Map "PerformanceByOwner" to "Collaborators"
        const collaborators = Object.entries(seasonalStats).map(([key, data]: [string, any]) => {
            const sStats = data;
            const meta = sStats.meta || {};

            // XP from Database (Persistent - Lifetime)
            const globalXp = meta.xp || 0;
            const level = meta.level || 1;
            // Formula must match server.ts (150 * level^2)
            const nextLevelXp = Math.floor(150 * Math.pow(level + 1, 2));

            // XP Session (Today) & Period
            const xpToday = sStats.xpToday || 0;
            const xpPeriod = sStats.xpPeriod || 0;

            // Use the sophisticated score calculated by the service
            const score = sStats.score || 70;

            // Revenue (Period specific)
            const revenue = sStats.revenue || 0;

            // Funnel (Seasonal)
            const userFunnel = Array.isArray(funnel) ? funnel.map(stage => {
                const stageObj = stage as any;
                return {
                    stage: stage.status,
                    value: stageObj[key] || 0,
                    rate: 0
                };
            }) : [];

            const maxContacted = Math.max(...userFunnel.map(s => s.value), 1);
            userFunnel.forEach(f => {
                f.rate = Math.round((f.value / maxContacted) * 100);
            });

            // Lifetime Stats from Gamification (Pre-calculated by script)
            const lifetime = (meta.gamification as any)?.lifetime || {};

            return {
                id: meta.id || key,
                name: meta.name || key,
                role: meta.role || 'Consultor',
                avatar: meta.avatar,
                level,
                xp: globalXp, // Always show Global XP for progress bar
                xpToday,
                xpPeriod, // XP Gained in this period
                nextLevelXp,
                score: level, // User requested Level to be the "Big Number"
                badges: (sStats.won || 0) > 5 ? ["Top Gun"] : [],
                addedToday: sStats.addedToday || 0,
                stats: {
                    contacts: lifetime.leads ?? (sStats.total || 0), // "LEADS" on card = Total Owned/Active
                    responses: lifetime.responses ?? (sStats.contacted || 0), // "RESP" = Total Responses
                    meetings: lifetime.meetings ?? (sStats.meeting || 0), // "MEET" = Total Meetings
                    sales: lifetime.sales ?? (sStats.won || 0), // "VENDAS" = Total Sales
                    revenue
                },
                funnel: userFunnel.slice(0, 4),
                pace: Math.min(Math.round(((sStats.contacted || 0) / 20) * 100), 100),
                quality: sStats.conversionRate || 0
            };
        });

        // Overview - Sum individual team members (event-based) to ensure consistency!
        const sumSales = Number(Object.values(seasonalStats).reduce((acc: any, val: any) => acc + (val.won || 0), 0));
        const sumMeetings = Number(Object.values(seasonalStats).reduce((acc: any, val: any) => acc + (val.meeting || 0), 0));
        const sumContacts = Number(Object.values(seasonalStats).reduce((acc: any, val: any) => acc + (val.contacted || 0), 0));
        const sumRevenue = Number(Object.values(seasonalStats).reduce((acc: any, val: any) => acc + (val.revenue || 0), 0));
        // Team Leads target should be Leads Added in Period
        const sumAdded = Number(Object.values(seasonalStats).reduce((acc: any, val: any) => acc + (val.addedToday || 0), 0));

        const overviewData = {
            totalLeads: sumAdded,
            totalSales: sumSales,
            totalMeetings: sumMeetings,
            totalContacts: sumContacts,
            conversionRate: sumAdded > 0 ? ((sumSales / sumAdded) * 100).toFixed(1) : 0,
            activeLeads: globalStats?.total || 0, // Snapshot
            growth: 0,
            revenue: sumRevenue,
            moneyOnTable: globalStats?.moneyOnTable || 0, // Snapshot
            pipelineValue: globalStats?.pipelineValue || 0 // Snapshot
        };

        // Time Data (Mock)
        const timeData = [
            { name: 'Seg', sales: 0, meetings: 0 },
            { name: 'Ter', sales: 0, meetings: 0 },
            { name: 'Qua', sales: 0, meetings: 0 },
            { name: 'Qui', sales: 0, meetings: 0 },
            { name: 'Sex', sales: 0, meetings: 0 },
        ];

        // (Feed and ActionTrend now fetched in parallel above)

        return NextResponse.json({
            overview: overviewData,
            collaborators: collaborators.sort((a, b) => (b.score || 0) - (a.score || 0)),
            timeData,
            calendar,
            feed,
            actionTrend: hourlyActions
        });

    } catch (error: any) {
        console.error('[SuperDash API] Crash Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch superdash stats',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
