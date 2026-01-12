import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lead_id = searchParams.get("lead_id");

    if (!lead_id) {
        return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
    }

    try {
        const contacts = await prisma.contact.findMany({
            where: { lead_id },
            orderBy: [
                { is_primary: "desc" },
                { created_at: "asc" }
            ]
        });
        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead_id, name, role, phone, whatsapp, email, is_primary, notes } = body;

        if (!lead_id || !name) {
            return NextResponse.json({ error: "lead_id and name are required" }, { status: 400 });
        }

        // If new contact is primary, unmark others
        if (is_primary) {
            await prisma.contact.updateMany({
                where: { lead_id, is_primary: true },
                data: { is_primary: false }
            });
        }

        const contact = await prisma.contact.create({
            data: {
                lead_id,
                name,
                role,
                phone,
                whatsapp,
                email,
                is_primary: is_primary || false,
                notes
            }
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
}
