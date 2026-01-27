
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const stages = await prisma.stages.findMany({
            orderBy: { position: 'asc' }
        });
        return NextResponse.json(stages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, phase } = data;

        // Find highest position
        const maxPos = await prisma.stages.aggregate({
            _max: { position: true }
        });
        const position = (maxPos._max.position || 0) + 1;

        // Use a default color
        const color = "bg-gray-500/10 text-gray-500 border-gray-500/20";

        const stage = await prisma.stages.create({
            data: {
                id: crypto.randomUUID(),
                name: name.toUpperCase().replace(/\s+/g, '_'), // Internal ID
                phase, // Display title
                color,
                position,
                updated_at: new Date()
            }
        });

        return NextResponse.json(stage);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create stage' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { name, phase } = await request.json();
        // We use updateMany because 'name' might not be @unique in schema (checking now)
        // If it is unique, update is better. But updateMany is safer if unsure.
        // Let's assume name is unique enough conceptually. 
        const stage = await prisma.stages.updateMany({
            where: { name: name },
            data: { phase }
        });
        return NextResponse.json(stage);
    } catch (error) {
        console.error("PATCH Stage Error:", error);
        return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
    }
}
