import { NextRequest, NextResponse } from 'next/server';
import { FileParser } from '@/lib/services/file-parser';
import { AiMapper } from '@/lib/services/ai-mapper';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Parse File
    const parseResult = await FileParser.parse(file);
    if (parseResult.error) {
        return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    // 2. Analyze Headers
    const mappingResult = await AiMapper.analyzeHeaders(parseResult.headers);

    return NextResponse.json({
        total: parseResult.data.length,
        headers: parseResult.headers,
        preview: parseResult.data.slice(0, 5), // Preview first 5 rows
        fullData: parseResult.data, // Send full data back (or store in temp/cache for larger files)
        mapping: mappingResult.mapping,
        confidence: mappingResult.confidence
    });
});
