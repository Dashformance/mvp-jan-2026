
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const leads = await prisma.leads.findMany({
        where: {
            OR: [
                { owner: { contains: 'joao', mode: 'insensitive' } },
                { owner: { contains: 'j. vitor', mode: 'insensitive' } }
            ],
            status: 'WON'
        }
    });
    console.log('JOAO_WON_LEADS_START');
    console.log(JSON.stringify(leads, null, 2));
    console.log('JOAO_WON_LEADS_END');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
