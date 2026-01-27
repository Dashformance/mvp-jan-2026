import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ACTION_POINTS, calculateLevel } from '@/lib/gamification';

export async function POST(request: Request) {
    const supabase = await createClient();

    if (!supabase) {
        return NextResponse.json({ error: 'Supabase functionality unavailable' }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { actionType, multiplier = 1 } = body;

        // Validar ActionType
        if (!actionType || !ACTION_POINTS[actionType as keyof typeof ACTION_POINTS]) {
            return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
        }

        const baseXP = ACTION_POINTS[actionType as keyof typeof ACTION_POINTS];

        // Buscar usuário no banco
        const dbUser = await prisma.user.findFirst({
            where: { email: user.email! }
        });

        if (!dbUser) {
            // Tenta buscar por uid se email falhar, ou retorna erro
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // TODO: Implementar lógica de Combo no backend para evitar cheat
        // Por enquanto usamos apenas baseXP para garantir persistência mínima
        const xpGained = baseXP * (multiplier || 1);

        const currentXP = dbUser.xp || 0;
        const currentLevel = dbUser.level || 1;
        const newXP = currentXP + xpGained;

        // Calcular novo level
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > currentLevel;

        // Atualizar usuário
        // Nota: também deveríamos atualizar estatísticas (gamification json), mas faremos simples por agora
        const updatedUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                xp: newXP,
                level: newLevel
            }
        });

        return NextResponse.json({
            success: true,
            xp: newXP,
            level: newLevel,
            xpGained,
            leveledUp
        });

    } catch (error) {
        console.error("Gamification Action Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
