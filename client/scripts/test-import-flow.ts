/**
 * Test Script: Import Flow Verification
 * 
 * This script simulates the import flow and verifies:
 * 1. Lead created with correct status
 * 2. Lead has correct owner_id
 * 3. Lead has contacts linked
 * 4. Lead appears in LeadsService.findAll()
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TEST_STAGE = 'INTERESSADO!';
const TEST_COMPANY = 'TESTE_IMPORT_' + Date.now();

async function runTests() {
    console.log('='.repeat(60));
    console.log('🧪 IMPORT FLOW TEST SUITE');
    console.log('='.repeat(60));

    let testLeadId: string | null = null;

    try {
        // 1. Get user for owner_id
        console.log('\n📋 Test 1: Fetching user for owner assignment...');
        const user = await prisma.user.findFirst({
            where: { email: 'joao@visualizen.com' }
        });

        if (!user) {
            throw new Error('User not found. Run seed-auth.ts first.');
        }
        console.log(`   ✅ User found: ${user.name} (${user.id})`);

        // 2. Verify stage exists
        console.log('\n📋 Test 2: Verifying stage exists...');
        const stage = await prisma.stage.findFirst({
            where: { name: TEST_STAGE }
        });

        if (!stage) {
            throw new Error(`Stage "${TEST_STAGE}" not found in database.`);
        }
        console.log(`   ✅ Stage found: "${stage.name}" (phase: "${stage.phase}")`);

        // 3. Simulate import - Create lead with contacts
        console.log('\n📋 Test 3: Creating lead via prisma.lead.create (simulating import)...');
        const createdLead = await prisma.lead.create({
            data: {
                company_name: TEST_COMPANY,
                trade_name: 'Teste Parcerias',
                status: TEST_STAGE,
                source: 'Test Script',
                owner_id: user.id,
                city: 'São Paulo',
                uf: 'SP',
                contacts: {
                    create: [
                        {
                            name: 'Contato Teste',
                            phone: '11999999999',
                            email: 'teste@test.com',
                            is_primary: true
                        }
                    ]
                }
            },
            include: { contacts: true }
        });
        testLeadId = createdLead.id;

        console.log(`   ✅ Lead created: ID=${createdLead.id}`);
        console.log(`      - status: "${createdLead.status}"`);
        console.log(`      - owner_id: "${createdLead.owner_id}"`);
        console.log(`      - contacts: ${createdLead.contacts.length}`);

        // 4. Verify status is correct
        console.log('\n📋 Test 4: Verifying lead status matches target...');
        if (createdLead.status !== TEST_STAGE) {
            throw new Error(`Status mismatch! Expected "${TEST_STAGE}", got "${createdLead.status}"`);
        }
        console.log(`   ✅ Status correct: "${createdLead.status}"`);

        // 5. Verify owner_id is correct (internal ID, not Supabase UID)
        console.log('\n📋 Test 5: Verifying owner_id is internal ID...');
        if (createdLead.owner_id !== user.id) {
            throw new Error(`Owner mismatch! Expected "${user.id}", got "${createdLead.owner_id}"`);
        }
        console.log(`   ✅ Owner ID correct: "${createdLead.owner_id}"`);

        // 6. Verify lead appears in query (simulating LeadsService.findAll)
        console.log('\n📋 Test 6: Verifying lead appears in findMany query...');
        const leads = await prisma.lead.findMany({
            where: {
                deletedAt: null,
                status: TEST_STAGE,
                company_name: TEST_COMPANY
            },
            include: { contacts: true }
        });

        if (leads.length === 0) {
            throw new Error('Lead not found in query!');
        }
        console.log(`   ✅ Lead found in query: ${leads.length} result(s)`);

        // 7. Verify contacts are linked
        console.log('\n📋 Test 7: Verifying contacts are properly linked...');
        const leadWithContacts = leads[0];
        if (!leadWithContacts.contacts || leadWithContacts.contacts.length === 0) {
            throw new Error('No contacts linked to lead!');
        }
        console.log(`   ✅ Contacts linked: ${leadWithContacts.contacts.length} contact(s)`);
        console.log(`      - Primary: ${leadWithContacts.contacts[0].name}`);

        // ALL TESTS PASSED
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exitCode = 1;
    } finally {
        // Cleanup: Delete test lead
        if (testLeadId) {
            console.log('\n🧹 Cleaning up test data...');
            await prisma.contact.deleteMany({ where: { lead_id: testLeadId } });
            await prisma.lead.delete({ where: { id: testLeadId } });
            console.log(`   Test lead ${testLeadId} deleted.`);
        }

        await prisma.$disconnect();
    }
}

runTests();
