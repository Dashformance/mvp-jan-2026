import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await LeadsService.hardDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[API] Hard delete failed for lead ${await params.then(p => p.id)}:`, error);
        return NextResponse.json({
            error: 'Failed to hard delete lead',
            details: error.message
        }, { status: 500 });
    }
}
