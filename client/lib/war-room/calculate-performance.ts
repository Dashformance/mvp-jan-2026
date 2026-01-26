
interface PerformanceInput {
    leadsContatados: number;
    metaLeads: number;
    reunioesAgendadas: number;
    metaReunioes: number;
    vendasRealizadas: number;
    metaVendas: number;
}

export function calculatePerformance(input: PerformanceInput): number {
    const {
        leadsContatados,
        metaLeads,
        reunioesAgendadas,
        metaReunioes,
        vendasRealizadas,
        metaVendas,
    } = input;

    // Weighted average (adjust weights as needed)
    const weights = {
        leads: 0.3,      // 30% peso
        reunioes: 0.3,   // 30% peso
        vendas: 0.4,     // 40% peso
    };

    const leadsScore = Math.min((leadsContatados / metaLeads) * 100, 100);
    const reunioesScore = Math.min((reunioesAgendadas / metaReunioes) * 100, 100);
    const vendasScore = Math.min((vendasRealizadas / metaVendas) * 100, 100);

    const totalScore =
        leadsScore * weights.leads +
        reunioesScore * weights.reunioes +
        vendasScore * weights.vendas;

    return Math.round(totalScore);
}
