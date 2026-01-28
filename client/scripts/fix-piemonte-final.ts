
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const joaoId = '21d216a4-e8c9-464d-b486-0b4db827f5ba';
    const joaoName = 'joao';

    console.log('--- REASSIGNING PIEMONTE TO JOÃO ---');

    const res = await prisma.leads.updateMany({
        where: {
            OR: [
                { company_name: { contains: 'Piemonte', mode: 'insensitive' } },
                { trade_name: { contains: 'Piemonte', mode: 'insensitive' } }
            ],
            deletedAt: null
        },
        data: {
            owner_id: joaoId,
            owner: joaoName
        }
    });

    console.log(`Updated ${res.count} Piemonte records for João.`);

    await prisma.$disconnect();
}

main();
