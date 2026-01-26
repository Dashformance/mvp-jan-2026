import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugStrings() {
    console.log('--- Debugging String Match ---');

    const lead = await prisma.lead.findFirst({
        where: { company_name: { contains: 'Trisul' } }
    });

    if (!lead) {
        console.log('Lead not found');
        return;
    }

    const stages = await prisma.stage.findMany();
    const interestedStage = stages.find(s => s.name.includes('INTERESSADO'));

    console.log(`Lead Status: '${lead.status}' (Length: ${lead.status.length})`);
    if (interestedStage) {
        console.log(`Stage Name : '${interestedStage.name}' (Length: ${interestedStage.name.length})`);

        console.log(`Match? ${lead.status === interestedStage.name}`);

        if (lead.status !== interestedStage.name) {
            console.log('MISMATCH DETECTED!');
            console.log('Lead codes:', lead.status.split('').map(c => c.charCodeAt(0)));
            console.log('Stage codes:', interestedStage.name.split('').map(c => c.charCodeAt(0)));
        }
    } else {
        console.log('Stage INTERESSADO not found in DB');
    }

    // Check Owner
    const user = await prisma.user.findUnique({ where: { email: 'joao@visualizen.com' } });
    if (user) {
        console.log(`Lead Owner  : '${lead.owner_id}'`);
        console.log(`User ID     : '${user.id}'`);
        console.log(`Owner Match? ${lead.owner_id === user.id}`);
    }
}

debugStrings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
