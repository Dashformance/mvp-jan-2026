
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
        const { name } = data; // Display title

        // Find highest position
        const maxPos = await prisma.stages.aggregate({
            _max: { position: true }
        });
        const position = (maxPos._max.position || 0) + 1;

        // Use a default color
        const color = "bg-gray-500/10 text-gray-500 border-gray-500/20";

        // Generate a human-readable level-based ID
        const nextLevel = position;
        const stageId = `nivel_${nextLevel}_custom`;

        const stage = await prisma.stages.create({
            data: {
                id: stageId,
                name, // Display title
                phase: name, // WORKAROUND: Prisma client is outdated and thinks phase is required
                color,
                position,
                updated_at: new Date()
            } as any
        });

        return NextResponse.json(stage);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create stage' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, name } = await request.json();
        const stage = await prisma.stages.update({
            where: { id: id },
            data: { name: name }
        });
        return NextResponse.json(stage);
    } catch (error) {
        console.error("PATCH Stage Error:", error);
        return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
    }
}
