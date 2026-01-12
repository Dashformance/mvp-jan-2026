import prisma from '../lib/prisma';
import { InteractionsService } from '../lib/services/interactions-service';

async function main() {
    console.log("Starting Verification for Interactions...");
    let leadId = "";

    try {
        // 1. Create a Test Lead
        console.log("1. Creating Test Lead...");
        const lead = await prisma.lead.create({
            data: {
                company_name: "Interaction Test Corp",
                status: "NEW",
                owner: "test_bot"
            }
        });
        leadId = lead.id;
        console.log("   Lead created:", leadId);

        // 2. Create Interaction via Service
        console.log("2. Creating Interaction (NOTE)...");
        const i1 = await InteractionsService.create({
            lead_id: leadId,
            type: 'NOTE',
            content: 'This is a test note.',
            user_id: 'test_user'
        });
        console.log("   Interaction created:", i1.id);

        // 3. Create Interaction via Service (CALL)
        console.log("3. Creating Interaction (CALL)...");
        const i2 = await InteractionsService.create({
            lead_id: leadId,
            type: 'CALL',
            content: 'Called and left voicemail.',
            user_id: 'test_user'
        });
        console.log("   Interaction created:", i2.id);

        // 4. List Interactions
        console.log("4. Listing Interactions...");
        const history = await InteractionsService.findByLead(leadId);
        console.log("   Found", history.length, "interactions.");

        if (history.length === 2 && history[0].type === 'CALL') { // Descending order
            console.log("✅ SUCCESS: Ordering correct (newest first).");
        } else {
            console.error("❌ FAILURE: Ordering or count incorrect.", history);
        }

        // 5. Delete Interaction
        console.log("5. Deleting Interaction...");
        await InteractionsService.delete(i1.id);
        const historyAfter = await InteractionsService.findByLead(leadId);
        if (historyAfter.length === 1) {
            console.log("✅ SUCCESS: Deletion correct.");
        } else {
            console.error("❌ FAILURE: Deletion failed.");
        }

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
    } finally {
        // Cleanup
        if (leadId) {
            console.log("Cleaning up...");
            await prisma.lead.delete({ where: { id: leadId } });
        }
        await prisma.$disconnect();
    }
}

main();
