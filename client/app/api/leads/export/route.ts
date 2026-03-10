import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeadsService } from '@/lib/services/leads-service';
import { UserService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await UserService.getOrCreateUser(user);
        if (!dbUser) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

        const url = new URL(req.url);
        const searchParams = url.searchParams;

        const search = searchParams.get('search') || undefined;
        // Depending on how KanbanView passes the array, it might be status=NEW,WON or status[]=NEW&status[]=WON
        let status: string[] | undefined = undefined;
        if (searchParams.has('status[]')) status = searchParams.getAll('status[]');
        else if (searchParams.has('status')) status = searchParams.get('status')?.split(',');

        let source: string[] | undefined = undefined;
        if (searchParams.has('source[]')) source = searchParams.getAll('source[]');
        else if (searchParams.has('source')) source = searchParams.get('source')?.split(',');

        const city = searchParams.get('city') || undefined;
        const sortBy = searchParams.get('sortBy') || undefined;
        const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

        const scoreMinParam = searchParams.get('scoreMin');
        const scoreMaxParam = searchParams.get('scoreMax');
        const scoreMin = scoreMinParam ? parseInt(scoreMinParam) : undefined;
        const scoreMax = scoreMaxParam ? parseInt(scoreMaxParam) : undefined;

        const view = searchParams.get('view') || 'mine';
        const ownerId = view === 'all' ? undefined : dbUser.id;

        const leadsData = await LeadsService.findAll(1, 10000, {
            search,
            status,
            ownerId,
            source,
            city,
            sortBy,
            sortOrder,
            scoreMin,
            scoreMax
        });

        const leads = leadsData.data || [];

        // Generate CSV
        const headers = [
            'Empresa',
            'Nome Fantasia',
            'CNPJ',
            'Telefone',
            'Email',
            'Responsável (Lead)',
            'Status',
            'Usuário Atribuído',
            'Valor Contrato',
            'Data Criação',
            'Fonte'
        ];

        const rows = leads.map((lead: any) => [
            `"${(lead.company_name || '').replace(/"/g, '""')}"`,
            `"${(lead.trade_name || '').replace(/"/g, '""')}"`,
            `"${(lead.cnpj || '').replace(/"/g, '""')}"`,
            `"${(lead.phone || '').replace(/"/g, '""')}"`,
            `"${(lead.email || '').replace(/"/g, '""')}"`,
            `"${(lead.decision_maker || '').replace(/"/g, '""')}"`,
            `"${(lead.status || '').replace(/"/g, '""')}"`,
            `"${(lead.User ? lead.User.name : (lead.owner || 'Sem Dono')).replace(/"/g, '""')}"`,
            `"${(lead.contract_value || 0).toString()}"`,
            `"${lead.date_added ? new Date(lead.date_added).toISOString() : ''}"`,
            `"${(lead.source || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="leads_export.csv"',
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
    }
}
