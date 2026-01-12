
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Migrating status column to text (Round 2)...');

    try {
        // 1. Drop Default Value
        await prisma.$executeRawUnsafe(`ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;`);
        console.log('Dropped default value.');

        // 2. Alter column to text (Idempotent-ish if already text, but valid)
        await prisma.$executeRawUnsafe(`ALTER TABLE "leads" ALTER COLUMN "status" TYPE text USING "status"::text;`);
        console.log('Converted column to text.');

        // 3. Drop the original Enum type
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "LeadStatus";`);
        console.log('Dropped LeadStatus enum.');

        // 4. Set Default Value back to 'NEW' (as text)
        await prisma.$executeRawUnsafe(`ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'NEW';`);
        console.log('Restored default value as string.');

    } catch (e) {
        console.error('Migration failed:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
