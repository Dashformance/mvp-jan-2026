
type InsightType = 'critical' | 'warning' | 'success' | 'info';

interface Insight {
    type: InsightType;
    message: string;
    icon: string;
}

// timeOfDay parameter is reserved for future use to provide time-contextual insights
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getInsight(performance: number, timeOfDay: 'morning' | 'afternoon' | 'evening'): Insight {
    // Critical (0-30%)
    if (performance < 30) {
        return {
            type: 'critical',
            icon: '⚠️',
            message: 'Atenção: ritmo muito abaixo do esperado!',
        };
    }

    // Warning (30-50%)
    if (performance < 50) {
        const messages = [
            'Ritmo pode melhorar — foco nas atividades!',
            'Hora de acelerar — vamos aumentar o ritmo!',
            'Estamos atrás da meta — bora recuperar!',
        ];
        return {
            type: 'warning',
            icon: '💡',
            message: messages[Math.floor(Math.random() * messages.length)],
        };
    }

    // Info (50-70%)
    if (performance < 70) {
        return {
            type: 'info',
            icon: '👍',
            message: 'Performance no ritmo — continue assim!',
        };
    }

    // Success (70-100%)
    const successMessages = [
        'Excelente! Time está voando! 🚀',
        'Performance excepcional! Mantém o ritmo! 🔥',
        'Arrasando! Meta praticamente garantida! 💪',
    ];
    return {
        type: 'success',
        icon: '🔥',
        message: successMessages[Math.floor(Math.random() * successMessages.length)],
    };
}
