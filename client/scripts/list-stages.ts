
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const stages = await prisma.stages.findMany({ orderBy: { position: 'asc' } });
        console.log('STAGES_JSON_START');
        console.log(JSON.stringify(stages, null, 2));
        console.log('STAGES_JSON_END');
    } catch (e) {
        console.error(e);
    }
}
main().finally(() => prisma.$disconnect());
