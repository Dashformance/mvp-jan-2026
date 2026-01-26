'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function searchLeadsAction(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const leads = await prisma.lead.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { company_name: { contains: query, mode: 'insensitive' } },
                    { trade_name: { contains: query, mode: 'insensitive' } },
                    // { decision_maker: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                company_name: true,
                trade_name: true,
                owner_user: {
                    select: { name: true, avatar_url: true }
                }
            },
            take: 5
        });
        return leads;
    } catch (error) {
        console.error('Search leads error:', error);
        return [];
    }
}

export async function scheduleMeeting(data: {
    leadId: string;
    date: Date;
    description?: string;
    participants?: string[];
}) {
    try {
        // Update the existing Lead
        // Set Status -> MEETING
        // Set Next Follow Up -> Date
        // Add participants to extra_info (merge with existing if needed, but for now replace/add)

        await prisma.lead.update({
            where: { id: data.leadId },
            data: {
                status: 'MEETING',
                next_followup_date: data.date,
                // We could append to notes, but usually a meeting has its own note field or we just leave it.
                // Storing participants in extra_info for now.
                extra_info: {
                    // We can't easily merge JSON in Prisma without raw query or fetching first. 
                    // For safety, let's just update the participants field.
                    // Assuming extra_info is an object.
                    participants: data.participants || [],
                    last_meeting_scheduled_at: new Date().toISOString()
                }
            }
        });

        revalidatePath('/super-dash');
        return { success: true };
    } catch (error) {

        console.error('Failed to schedule meeting:', error);
        return { success: false, error: 'Failed to schedule meeting' };
    }
}

export async function createMeeting(data: {
    title: string;
    date: Date;
    participants: string[];
}) {
    try {
        const { title, date, participants } = data;

        // Try to find a lead that matches the title
        let lead = await prisma.lead.findFirst({
            where: {
                OR: [
                    { company_name: { equals: title, mode: 'insensitive' } },
                    { trade_name: { equals: title, mode: 'insensitive' } }
                ]
            }
        });

        if (!lead) {
            // Create new lead if not found
            // We set status to MEETING immediately
            lead = await prisma.lead.create({
                data: {
                    company_name: title,
                    trade_name: title,
                    status: 'MEETING',
                    next_followup_date: date,
                    extra_info: {
                        participants: participants || [],
                        created_via: 'calendar_modal'
                    }
                }
            });
        } else {
            // Update existing lead
            await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    status: 'MEETING',
                    next_followup_date: date,
                    extra_info: {
                        // @ts-ignore: Assuming extra_info is object
                        ...(lead.extra_info as object || {}),
                        participants: participants || [],
                        last_meeting_scheduled_at: new Date().toISOString()
                    }
                }
            });
        }

        revalidatePath('/super-dash');
        return { success: true };
    } catch (error) {
        console.error('Failed to create meeting:', error);
        return { success: false, error: 'Failed to create meeting' };
    }
}

