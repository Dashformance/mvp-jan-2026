import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verificar leads vivos nesta coluna
    const leadCount = await prisma.leads.count({
        where: { status: params.id, deletedAt: null }
    });

    if (leadCount > 0) {
        return NextResponse.json({
            error: 'HAS_LEADS',
            count: leadCount,
            message: `Esta coluna tem ${leadCount} lead${leadCount > 1 ? 's' : ''}. Mova-os para outra coluna antes de excluir.`
        }, { status: 400 });
    }

    try {
        await prisma.stages.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to delete column', message: err.message }, { status: 500 });
    }
}
