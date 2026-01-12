import prisma from '../prisma';

export const InteractionsService = {
    async findByLead(leadId: string) {
        return prisma.interaction.findMany({
            where: { lead_id: leadId },
            orderBy: { date: 'desc' },
        });
    },

    async create(data: {
        lead_id: string;
        type: string;
        content: string;
        user_id?: string | null;
        date?: Date | string;
    }) {
        const interactionDate = data.date ? new Date(data.date) : new Date();

        // 1. Create Interaction
        const interaction = await prisma.interaction.create({
            data: {
                lead_id: data.lead_id,
                type: data.type,
                content: data.content,
                user_id: data.user_id,
                date: interactionDate,
            },
        });

        // 2. Update Lead's last_contact_date
        await prisma.lead.update({
            where: { id: data.lead_id },
            data: {
                last_contact_date: interactionDate,
                updated_at: new Date() // Ensure updated_at is refreshed
            }
        });

        return interaction;
    },

    async delete(id: string) {
        return prisma.interaction.delete({
            where: { id },
        });
    },
};
