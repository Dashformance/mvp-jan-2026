const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    console.log('--- DB Connection Test ---');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('✅ Connection successful!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.message.includes('Can\'t reach database server')) {
            console.log('\n💡 Tip: Check if your IP is whitelisted in Supabase and if the DATABASE_URL is correct.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
