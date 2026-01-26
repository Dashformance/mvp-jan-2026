const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIndexes() {
    try {
        console.log('--- Checking Database Indexes ---');
        // Query pg_indexes for Postgres
        const res = await prisma.$queryRaw`
            SELECT tablename, indexname, indexdef 
            FROM pg_indexes 
            WHERE schemaname = 'public' AND tablename = 'leads';
        `;
        console.log('Indexes for table "leads":');
        console.table(res);

        // Also check columns for extra constraints
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'leads' AND table_schema = 'public';
        `;
        console.log('Columns for table "leads":');
        console.table(columns);

    } catch (error) {
        console.error('❌ Failed to check indexes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkIndexes();
