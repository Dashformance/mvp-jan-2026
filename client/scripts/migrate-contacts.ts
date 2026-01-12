import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting migration: Leads -> Contacts");

    const leads = await prisma.lead.findMany({
        where: {
            contacts: {
                none: {},
            },
        },
    });

    console.log(`Found ${leads.length} leads without contacts.`);

    let migratedCount = 0;

    for (const lead of leads) {
        if (!lead.decision_maker && !lead.phone && !lead.email) {
            continue; // Nothing to migrate
        }

        const contactName = lead.decision_maker || "Contato Principal";

        await prisma.contact.create({
            data: {
                lead_id: lead.id,
                name: contactName,
                role: "Decisor/Principal",
                phone: lead.phone,
                email: lead.email,
                is_primary: true,
                notes: "Migrado automaticamente do cadastro do Lead.",
            },
        });

        migratedCount++;
        process.stdout.write(`\rMigrated: ${migratedCount}/${leads.length}`);
    }

    console.log("\nMigration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
