import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePlayerCard, getEditionLabel, getRoleAbbreviation } from '@/lib/utils/score-calculator';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Buscar owners únicos
        const ownersResult = await prisma.leads.groupBy({
            by: ['owner'],
            where: {
                deletedAt: null,
                owner: { not: null }
            },
        });

        const owners = ownersResult
            .map(r => r.owner)
            .filter((o): o is string => o !== null);

        // Buscar stats de cada vendedor
        const playerCards = await Promise.all(
            owners.map(async (owner, index) => {
                const [leads, respostas, reunioes, vendas] = await Promise.all([
                    // Total de leads
                    prisma.leads.count({
                        where: { owner, deletedAt: null },
                    }),
                    // Leads com resposta (CONTACTED, MEETING, WON)
                    prisma.leads.count({
                        where: {
                            owner,
                            deletedAt: null,
                            status: { in: ['CONTACTED', 'MEETING', 'WON'] }
                        },
                    }),
                    // Reuniões
                    prisma.leads.count({
                        where: { owner, deletedAt: null, status: 'MEETING' },
                    }),
                    // Vendas
                    prisma.leads.count({
                        where: { owner, deletedAt: null, status: 'WON' },
                    }),
                ]);

                // Gerar dados do card
                // Note: Replacing generatePlayerCardData with generatePlayerCard as per implementation
                const cardData = generatePlayerCard(
                    { leads, respostas, reunioes, vendas },
                    index + 1,
                    owners.length,
                    5, // streak (placeholder)
                    undefined
                );

                // Gerar iniciais
                const nameParts = owner.split(' ');
                const initials = nameParts.length > 1
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                    : owner.substring(0, 2).toUpperCase();

                // Determinar role
                // Tentar buscar do usuário se existir, senão default
                const user = await prisma.user.findFirst({
                    where: { name: owner }
                });

                const role = user ? getRoleAbbreviation(user.role) : getRoleAbbreviation('SDR');

                return {
                    id: owner.toLowerCase().replace(/\s/g, '-'),
                    name: owner.length > 10 ? `${owner.split(' ')[0][0]}. ${owner.split(' ').pop()}` : owner,
                    fullName: owner,
                    initials,
                    avatar: user?.avatar_url,
                    role,
                    level: Math.floor(cardData.stats.xpDia / 100) + 1,
                    ranking: index + 1,
                    period: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                    edition: getEditionLabel(index + 1, cardData.score),
                    ...cardData,
                };
            })
        );

        // Ordenar por score (maior primeiro)
        playerCards.sort((a, b) => b.score - a.score);

        // Atualizar rankings após ordenação
        playerCards.forEach((card, index) => {
            card.ranking = index + 1;
            card.edition = getEditionLabel(index + 1, card.score);
        });

        return NextResponse.json(playerCards);
    } catch (error) {
        console.error('Error fetching player scores:', error);
        return NextResponse.json(
            { error: 'Failed to fetch player scores' },
            { status: 500 }
        );
    }
}
