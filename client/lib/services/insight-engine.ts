import { AnalyticsService } from './analytics-service';

export class InsightEngine {
    static async generateInsights(userId?: string) {
        const data = await AnalyticsService.getPerformanceReport(userId);
        const insights: string[] = [];

        // 1. Funnel Health
        const inboxCount = data.snapshot[0]?.count || 0;
        const step1Count = data.snapshot[1]?.count || 0;
        const step2Count = data.snapshot[2]?.count || 0;
        const step4Count = data.snapshot[4]?.count || 0; // Meetings

        if (inboxCount > 20) {
            insights.push(`🚨 ALERTA DE CARGA: Há ${inboxCount} leads aguardando triagem no Inbox. Isso indica um gargalo no início do processo.`);
        }

        if (step1Count > 0 && step2Count === 0 && data.flow.conversions === 0) {
            insights.push(`⚠️ BAIXA ATIVIDADE: Existem leads parados na primeira etapa sem prospecção iniciada na última semana.`);
        }

        // 2. Conversion Efficiency
        const totalFlow = data.flow.stepTransitions.length;
        const meetingFlow = data.flow.stepTransitions.filter(t => t.toStep === 4).length;

        if (totalFlow > 0) {
            const meetRate = (meetingFlow / totalFlow * 100).toFixed(1);
            insights.push(`📈 EFICIÊNCIA: A conversão de movimentações para Reunião está em ${meetRate}% nesta semana.`);
        }

        // 3. Productivity
        if (data.activities === 0 && totalFlow > 0) {
            insights.push(`ℹ️ OBSERVAÇÃO: Movimentações registradas sem registros de mensagens/calls. Verifique se o time está registrando as interações corretamente.`);
        }

        return {
            summary: insights,
            score: this.calculateHealthScore(data)
        };
    }

    private static calculateHealthScore(data: any): number {
        let score = 70; // Base score
        if (data.snapshot[0].count > 50) score -= 20;
        if (data.flow.conversions > 10) score += 10;
        if (data.flow.stepTransitions.filter((t: any) => t.toStep >= 4).length > 0) score += 20;
        return Math.min(100, Math.max(0, score));
    }
}
