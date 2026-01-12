import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Enabling Realtime for contacts table...");
        // Attempt to add contacts table to supabase_realtime publication
        // This requires privileges. If it fails, the user must do it manually.
        await prisma.$executeRawUnsafe(`
      ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
    `);
        console.log("Successfully enabled Realtime for contacts.");
    } catch (error) {
        if (error instanceof Error && error.message.includes("already in publication")) {
            console.log("Contacts table is already in supabase_realtime publication.");
        } else {
            console.error("Error enabling Realtime:", error);
            console.log("NOTE: You may need to enable Realtime manually in the Supabase Dashboard if this user does not have permissions.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
