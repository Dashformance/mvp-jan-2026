import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // If setting to primary, unset others for this lead
        if (body.is_primary) {
            // First get the contact to find the lead_id
            const existingContact = await prisma.contacts.findUnique({ where: { id } });
            if (existingContact) {
                await prisma.contacts.updateMany({
                    where: {
                        lead_id: existingContact.lead_id,
                        id: { not: id }, // Don't update self yet
                        is_primary: true
                    },
                    data: { is_primary: false }
                });
            }
        }

        const contact = await prisma.contacts.update({
            where: { id },
            data: body
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        await prisma.contacts.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
    }
}
