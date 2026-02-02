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
            case '7d':
                SEASON_START_DATE = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '15d':
                SEASON_START_DATE = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
                break;
            case 'total':
                SEASON_START_DATE = new Date('2025-01-01T00:00:00-03:00'); // Assuming project start or reasonable beginning
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
                SEASON_START_DATE = new Date('2025-01-01T00:00:00-03:00'); // Fallback to "all time" or season start
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

        // Overview - Use globalStats for sales (current lead status), collaborators for contacts/meetings (event-based)
        const overviewData = {
            totalLeads: globalStats?.total || 0,
            totalSales: globalStats?.totalSales || 0, // CRITICAL: Use current lead status, NOT interaction events
            totalMeetings: globalStats?.totalMeetings || collaborators.reduce((acc, c) => acc + c.stats.meetings, 0),
            totalContacts: globalStats?.totalContacts || collaborators.reduce((acc, c) => acc + c.stats.contacts, 0),
            conversionRate: globalStats?.total > 0 ? ((globalStats?.totalSales || 0) / globalStats.total * 100).toFixed(1) : 0,
            activeLeads: globalStats?.total || 0,
            growth: 0,
            revenue: globalStats?.revenue || 0,
            moneyOnTable: globalStats?.moneyOnTable || 0,
            pipelineValue: globalStats?.pipelineValue || 0
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
