
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ANALYZING DUPLICATES ---');

    const leads = await prisma.leads.findMany({
        where: { deletedAt: null },
        select: { id: true, company_name: true, trade_name: true, email: true, phone: true, cnpj: true }
    });

    console.log(`Total active leads: ${leads.length}`);

    const byName = new Map<string, any[]>();
    const byEmail = new Map<string, any[]>();

    leads.forEach(l => {
        const name = (l.company_name || l.trade_name || '').toLowerCase().trim();
        if (name) {
            if (!byName.has(name)) byName.set(name, []);
            byName.get(name)!.push(l);
        }

        const email = (l.email || '').toLowerCase().trim();
        if (email && email.includes('@')) {
            if (!byEmail.has(email)) byEmail.set(email, []);
            byEmail.get(email)!.push(l);
        }
    });

    console.log('\nDuplicates by Name:');
    let nameDupCount = 0;
    for (const [name, matches] of byName) {
        if (matches.length > 1) {
            console.log(` - "${name}": ${matches.length} instances`);
            matches.forEach(m => console.log(`   ID: ${m.id} | CNPJ: ${m.cnpj}`));
            nameDupCount++;
        }
    }

    console.log('\nDuplicates by Email:');
    let emailDupCount = 0;
    for (const [email, matches] of byEmail) {
        if (matches.length > 1) {
            console.log(` - "${email}": ${matches.length} instances`);
            emailDupCount++;
        }
    }

    console.log(`\nFound ${nameDupCount} groups with duplicate names.`);
    console.log(`Found ${emailDupCount} groups with duplicate emails.`);
}

main().finally(() => prisma.$disconnect());
