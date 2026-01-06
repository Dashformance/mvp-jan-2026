import { NextRequest, NextResponse } from 'next/server';
import { ExtractionService } from '@/lib/services/extraction-service';

export async function POST(req: NextRequest) {
    try {
        const { params, limit } = await req.json();
        const results = await ExtractionService.extractAndSave(params, limit, true); // dryRun = true for preview
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to preview extraction' }, { status: 500 });
    }
}
