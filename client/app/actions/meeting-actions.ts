'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function searchLeadsAction(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const leads = await prisma.leads.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { company_name: { contains: query, mode: 'insensitive' } },
                    { trade_name: { contains: query, mode: 'insensitive' } },
                ]
            },
            select: {
                id: true,
                company_name: true,
                trade_name: true,
                User: {
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
        // Fetch current extra_info to avoid wiping
        const currentLead = await prisma.leads.findUnique({ where: { id: data.leadId }, select: { extra_info: true } });
        const currentExtra = (currentLead?.extra_info as any) || {};

        await prisma.leads.update({
            where: { id: data.leadId },
            data: {
                status: 'MEETING',
                next_followup_date: data.date,
                extra_info: {
                    ...currentExtra,
                    participants: data.participants || [],
                    last_meeting_scheduled_at: new Date().toISOString()
                }
            }
        });

        // XP Trigger
        const lead = await prisma.leads.findUnique({ where: { id: data.leadId }, select: { owner_id: true } });
        if (lead?.owner_id) {
            const { GamificationService } = await import('@/lib/gamification/server');
            await GamificationService.addXP(lead.owner_id, 'LEAD_QUALIFIED');
        }

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
        let lead = await prisma.leads.findFirst({
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
            lead = await prisma.leads.create({
                data: {
                    id: crypto.randomUUID(),
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
            await prisma.leads.update({
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
            // XP Trigger
            if (lead.owner_id) {
                const { GamificationService } = await import('@/lib/gamification/server');
                await GamificationService.addXP(lead.owner_id, 'LEAD_QUALIFIED');
            }
        }

        revalidatePath('/super-dash');
        return { success: true };
    } catch (error) {
        console.error('Failed to create meeting:', error);
        return { success: false, error: 'Failed to create meeting' };
    }
}


export async function deleteMeeting(leadId: string) {
    try {
        if (!leadId) throw new Error('Lead ID is required');

        await prisma.leads.update({
            where: { id: leadId },
            data: {
                next_followup_date: null,
                status: 'CONTACTED' // Revert to contacted as safe default
            }
        });

        revalidatePath('/super-dash');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete meeting:', error);
        return { success: false, error: 'Failed to delete meeting' };
    }
}
