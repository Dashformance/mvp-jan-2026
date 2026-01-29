
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseVitor() {
    console.log('--- DIAGNOSING VITOR ---');

    // Hardcode Vitor's probable identifiers based on previous context
    const targetNames = ['Vitor', 'VTZ-VITOR', 'VTZ'];
    const targetEmail = 'vitor@visualizen.com';

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'vitor', mode: 'insensitive' } },
                { name: { contains: 'vitor', mode: 'insensitive' } }
            ]
        }
    });

    if (!user) {
        console.log('User Vitor not found in DB');
        return;
    }

    console.log('Found User:', user.name, user.id, user.email);

    // Check last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const interactions = await prisma.interactions.findMany({
        where: {
            user_id: user.id, // Check by ID
            date: { gte: sevenDaysAgo }
        },
        take: 50,
        orderBy: { date: 'desc' }
    });

    console.log(`Found ${interactions.length} interactions in last 7 days.`);

    const byType = interactions.reduce((acc: any, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {});

    console.log('Interactions by Type:', byType);

    // Check for specific "Response" indicators
    const responses = interactions.filter(i =>
        i.type === 'STATUS_CHANGE' && (i.content.includes('CONTACTED') || i.content.includes('Step 2')) // Assuming Step 2 is Response/Contacted
    );

    console.log('Potential Responses (STATUS_CHANGE to CONTACTED/Step 2):');
    responses.forEach(r => console.log(` - ${r.date.toISOString()} | ${r.content}`));

    // Check by NAME string just in case legacy data uses name
    const interactionsByName = await prisma.interactions.count({
        where: {
            user_id: { in: [user.name, 'VTZ-VITOR'] }, // Try name variations if ID fails
            date: { gte: sevenDaysAgo }
        }
    });
    console.log('Interactions found by Name string (legacy check):', interactionsByName);

}

diagnoseVitor()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
