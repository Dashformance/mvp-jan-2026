import { NextRequest, NextResponse } from 'next/server';
import { InteractionsService } from '@/lib/services/interactions-service';
import { withApiErrorHandling } from '@/lib/api-handler';

export const DELETE = withApiErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await InteractionsService.delete(id);
    return NextResponse.json({ success: true });
});
