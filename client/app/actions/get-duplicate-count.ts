'use server';

import { LeadsService } from "@/lib/services/leads-service";

export async function getDuplicateCountAction() {
    try {
        const result = await LeadsService.getDuplicateCount();
        return { success: true, ...result };
    } catch (error) {
        console.error('Error in getDuplicateCountAction:', error);
        return { success: false, error: 'Erro ao contar duplicatas' };
    }
}
