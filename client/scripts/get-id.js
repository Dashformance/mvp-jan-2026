const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const lead = await prisma.leads.findFirst({ select: { id: true } });
    console.log(lead.id);
    await prisma.$disconnect();
}
main();
