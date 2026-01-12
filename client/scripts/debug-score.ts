
import { PrismaClient } from '@prisma/client';
import { calculateAdvancedScore } from '../lib/services/lead-sanitizer';

const prisma = new PrismaClient();

async function debugLead() {
    const lead = await prisma.lead.findFirst({
        where: { trade_name: { contains: 'engeed_inc', mode: 'insensitive' } }
    });

    if (!lead) {
        console.log('Lead not found!');
        return;
    }

    console.log('Found ID:', lead.id);
    console.log('Current DB Score:', lead.score);
    console.log('Extra Info:', JSON.stringify(lead.extra_info, null, 2));

    const calculated = calculateAdvancedScore({
        ...lead,
        extra_info: lead.extra_info as any || {}
    });

    console.log('Calculated Score:', calculated);
}

debugLead()
    .finally(async () => {
        await prisma.$disconnect();
    });
