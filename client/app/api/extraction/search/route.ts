import { NextRequest, NextResponse } from 'next/server';
import { ExtractionService } from '@/lib/services/extraction-service';

export async function POST(req: NextRequest) {
    try {
        const { params } = await req.json();
        const results = await ExtractionService.searchCompanies(params);
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
    }
}
