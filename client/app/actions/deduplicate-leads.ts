'use server';

import { LeadsService } from "@/lib/services/leads-service";
import { revalidatePath } from "next/cache";

export async function deduplicateLeadsAction() {
    try {
        const result = await LeadsService.deduplicate();
        revalidatePath('/kanban'); // Revalidate the main pipeline
        return { success: true, ...result };
    } catch (error) {
        console.error('Error in deduplicateLeadsAction:', error);
        return { success: false, error: 'Erro ao limpar duplicatas' };
    }
}
