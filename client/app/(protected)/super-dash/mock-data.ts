
export const MOCK_SUPERDASH_DATA = {
    overview: {
        totalLeads: 1245,
        totalSales: 84,
        conversionRate: 6.8,
        activeLeads: 432,
        growth: 12.5 // % vs last month
    },
    collaborators: [
        {
            id: '1',
            name: "João Silva",
            role: "SDR Senior",
            avatar: "JS",
            level: 1,
            xp: 12500,
            nextLevelXp: 15000,
            score: 98, // Gamification Score (0-100)
            badges: ["Closer da Semana", "Top Gun"],
            stats: {
                messages: 450,
                contacts: 145,
                responses: 68,
                meetings: 24,
                sales: 5,
                revenue: 12500,
                negotiation: 8,
                negotiationValue: 20000
            },
            funnel: [
                { stage: "Contatados", value: 145, rate: 100 },
                { stage: "Respondidos", value: 68, rate: 46 },
                { stage: "Reuniões", value: 24, rate: 16 },
                { stage: "Em Negociação", value: 8, rate: 5.5 },
                { stage: "Vendas", value: 5, rate: 3.4 }
            ],
            pace: 75, // Empenho (0-100)
            quality: 82 // Qualidade (0-100)
        },
        {
            id: '2',
            name: "Maria Costa",
            role: "Closer",
            avatar: "MC",
            level: 8,
            xp: 8400,
            nextLevelXp: 10000,
            score: 85,
            badges: [],
            stats: {
                messages: 320,
                contacts: 98,
                responses: 52,
                meetings: 30,
                sales: 8,
                revenue: 24000,
                negotiation: 12,
                negotiationValue: 35000
            },
            funnel: [
                { stage: "Contatados", value: 98, rate: 100 },
                { stage: "Respondidos", value: 52, rate: 53 },
                { stage: "Reuniões", value: 30, rate: 30 },
                { stage: "Em Negociação", value: 12, rate: 12.2 },
                { stage: "Vendas", value: 8, rate: 8.1 }
            ],
            pace: 90,
            quality: 70
        },
        {
            id: '3',
            name: "Pedro Santos",
            role: "SDR Junior",
            avatar: "PS",
            level: 3,
            xp: 3200,
            nextLevelXp: 5000,
            score: 64,
            badges: ["Rookie"],
            stats: {
                messages: 600,
                contacts: 210,
                responses: 40,
                meetings: 8,
                sales: 1,
                revenue: 2500,
                negotiation: 3,
                negotiationValue: 5000
            },
            funnel: [
                { stage: "Contatados", value: 210, rate: 100 },
                { stage: "Respondidos", value: 40, rate: 19 },
                { stage: "Reuniões", value: 8, rate: 3.8 },
                { stage: "Em Negociação", value: 3, rate: 1.4 },
                { stage: "Vendas", value: 1, rate: 0.4 }
            ],
            pace: 95, // Muito esforço
            quality: 40 // Baixa conversão
        }
    ],
    timeData: [
        { name: 'Seg', sales: 4, meetings: 12 },
        { name: 'Ter', sales: 3, meetings: 8 },
        { name: 'Qua', sales: 7, meetings: 15 },
        { name: 'Qui', sales: 5, meetings: 10 },
        { name: 'Sex', sales: 6, meetings: 14 },
    ]
};
