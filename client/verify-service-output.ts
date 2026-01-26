import { PrismaClient } from '@prisma/client';
import { LeadsService } from './lib/services/leads-service';

const prisma = new PrismaClient();

async function checkService() {
    console.log('--- Checking LeadsService Output ---');

    // Verify user ID first
    const user = await prisma.user.findUnique({ where: { email: 'joao@visualizen.com' } });
    if (!user) throw new Error('User not found');
    console.log(`User ID: ${user.id}`);

    // Simulate Frontend Call
    const result = await LeadsService.findAll(1, 1000, {
        ownerId: user.id,
        sortBy: 'date_added',
        sortOrder: 'desc'
    });

    console.log(`Leads Found: ${result.data.length}`);

    const trisulLead = result.data.find(l => l.company_name?.includes('Trisul'));
    if (trisulLead) {
        console.log('[FOUND] Lead Trisul in Service Output:');
        console.log(`- ID: ${trisulLead.id}`);
        console.log(`- Status: "${trisulLead.status}"`);
        console.log(`- Owner: ${trisulLead.owner_id}`);
        console.log(`- DeleteAt: ${trisulLead.deletedAt}`);
    } else {
        console.log('[NOT FOUND] Lead Trisul NOT in Service Output.');
    }
}

checkService()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
