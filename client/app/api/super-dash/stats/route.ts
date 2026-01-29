import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

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

        console.log(`[SuperDash API] Fetching stats for period: ${period}. Start: ${SEASON_START_DATE.toISOString()}`);

        // 1. Fetch LIFE TIME DATA (For Revenue - Optional: Make strict if needed)
        // For SuperDash filters, usually we want "Revenue in Period", so we should pass the date too.
        // But "Level" and "XP" are lifetime concepts in RPG. We should be careful.
        // DECISION: 
        // - RPG Stats (Level, Total XP) -> Lifetime (Constant)
        // - Performance Stats (Sales, Meetings, XP Today) -> Period (Filtered)

        const lifetimeStats = await LeadsService.getPerformanceByOwner(); // Used for Fallback Levels/XP

        // 2. Fetch SEASONAL DATA (Filtered by Date)
        let funnel: any[] = [];
        let seasonalStats: any = {};
        let regionDistribution: any = [];
        let globalStats: any = { revenue: 0, pipelineValue: 0 };
        let calendar: any[] = [];

        try {
            [funnel, seasonalStats, regionDistribution, globalStats, calendar] = await Promise.all([
                LeadsService.getConversionFunnel(SEASON_START_DATE).catch(e => { console.error('Funnel error:', e); return []; }),
                LeadsService.getPerformanceByOwner(SEASON_START_DATE, SEASON_END_DATE).catch(e => { console.error('Seasonal stats error:', e); return {}; }),
                LeadsService.getLeadsByState().catch(e => { console.error('Regions error:', e); return []; }),
                LeadsService.getStatsOverview(undefined, SEASON_START_DATE, SEASON_END_DATE).catch(e => { console.error('Overview stats error:', e); return { revenue: 0, pipelineValue: 0 }; }),
                LeadsService.getUpcomingMeetings(100).catch(e => { console.error('Calendar error:', e); return []; })
            ]);
        } catch (err) {
            console.error('Critical Promise.all failure:', err);
        }

        // Map "PerformanceByOwner" to "Collaborators"
        const collaborators = Object.entries(seasonalStats).map(([key, data]: [string, any]) => {
            const sStats = data;
            const meta = sStats.meta || {};

            // Use LIFETIME stats for Level/XP if not in seasonal (though leads-service returns strict meta)
            // Correction: sStats.meta contains the USER info which is consistent. 
            // However, sStats.xp is "Period XP" or "Global XP"? 
            // In getPerformanceByOwner, meta.xp is Global. sStats.xpPeriod is Date Range XP.

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
            const userFunnel = funnel.map(stage => {
                const stageObj = stage as any;
                return {
                    stage: stage.status,
                    value: stageObj[key] || 0,
                    rate: 0
                };
            });

            const maxContacted = Math.max(...userFunnel.map(s => s.value), 1);
            userFunnel.forEach(f => {
                f.rate = Math.round((f.value / maxContacted) * 100);
            });

            return {
                id: meta.id || key,
                name: meta.name || key,
                role: meta.role || 'Consultor',
                avatar: meta.avatar,
                level,
                xp: globalXp, // Always show Global XP for progress bar
                xpToday,
                xpPeriod, // XP Gained in this period (can be used for ranking if requested)
                nextLevelXp,
                score,
                badges: sStats.sold > 5 ? ["Top Gun"] : [],
                addedToday: sStats.addedToday,
                stats: {
                    contacts: sStats.lifetimeTotal, // LEADS (Fixed 5-Day Window)
                    responses: sStats.lifetimeResp, // RESP (Fixed 5-Day Window)
                    meetings: sStats.lifetimeMeet, // MEET (Fixed 5-Day Window)
                    sales: sStats.lifetimeSold, // VENDAS (Fixed 5-Day Window)
                    revenue // Revenue (Fixed 5-Day Window)
                },
                funnel: userFunnel.slice(0, 4),
                pace: Math.min(Math.round((sStats.contacted / 20) * 100), 100),
                quality: sStats.conversionRate
            };
        });

        // Overview
        const totalSalesSeasonal = collaborators.reduce((acc, c) => acc + c.stats.sales, 0);
        const activeLeadsSeasonal = collaborators.reduce((acc, c) => acc + c.stats.contacts, 0);

        const overview = {
            totalLeads: activeLeadsSeasonal,
            totalSales: totalSalesSeasonal,
            conversionRate: activeLeadsSeasonal > 0 ? ((totalSalesSeasonal / activeLeadsSeasonal) * 100).toFixed(1) : 0,
            activeLeads: activeLeadsSeasonal,
            growth: 0,
            revenue: globalStats.revenue,
            moneyOnTable: globalStats.moneyOnTable,
            pipelineValue: globalStats.pipelineValue
        };

        // Time Data (Mock - TODO: Make real with getTimelineStats(days) if needed)
        const timeData = [
            { name: 'Seg', sales: 0, meetings: 0 },
            { name: 'Ter', sales: 0, meetings: 0 },
            { name: 'Qua', sales: 0, meetings: 0 },
            { name: 'Qui', sales: 0, meetings: 0 },
            { name: 'Sex', sales: 0, meetings: 0 },
        ];

        // 5. Fetch Activity Feed (Real) - Limit by date? Usually Feed is just "Recent", regardless of filter.
        // Let's keep feed recent.
        const feed = await LeadsService.getRecentActivity(20);

        // 6. Fetch Activity Trend (Real-time or Period)
        let hourlyActions = [];
        try {
            if (period === 'today') {
                console.log(`[SuperDash API] Fetching 24h rolling activity trend...`);
                hourlyActions = await LeadsService.getHourlyActivity();
            } else {
                console.log(`[SuperDash API] Fetching trend for ${period}. Start: ${SEASON_START_DATE?.toISOString()} End: ${SEASON_END_DATE?.toISOString()}`);
                hourlyActions = await LeadsService.getActivityTrend(SEASON_START_DATE, SEASON_END_DATE || now);
            }
        } catch (trendError) {
            console.error('[SuperDash API] Trend Error:', trendError);
            hourlyActions = []; // Fallback
        }

        return NextResponse.json({
            overview,
            collaborators: collaborators.sort((a, b) => b.score - a.score),
            timeData,
            calendar,
            feed,
            actionTrend: hourlyActions
        });

    } catch (error) {
        console.error('Superdash Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch superdash stats' }, { status: 500 });
    }
}
