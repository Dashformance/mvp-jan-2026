"use client";

import { useState } from 'react';
import { toast } from "sonner";
import { useKanban } from '../kanban-context';
import { useGamification } from '@/hooks/useGamification';

const API_URL = "/api";

export function useLeadImport() {
    const { fetchLeads, setFilterBarState } = useKanban();
    const { addBulkImportXP } = useGamification();

    const [extracting, setExtracting] = useState(false);
    const [importProgress, setImportProgress] = useState<{
        current: number;
        total: number;
        status: string;
        stage: number;
        scanned?: number;
        checked?: number;
    } | null>(null);

    const [candidates, setCandidates] = useState<any[]>([]);
    const [isConfirmingSave, setIsConfirmingSave] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

    const startImport = async (quantity: number, filters: any) => {
        setExtracting(true);
        setImportProgress({ current: 0, total: quantity, status: 'Iniciando extração...', stage: 0 });

        try {
            setImportProgress({ current: 0, total: quantity, status: 'Conectando à Casa dos Dados...', stage: 1 });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000);

            // Build params similar to page.tsx logic - moved to helper or passed in
            // Assuming 'filters' passed here is already the API param structure or the hook caller handles conversion
            // Let's assume passed filters are RAW filter state, and we need conversion logic or we fetch from context?
            // Better: context exposes current raw filters, we need 'buildApiParams' logic.
            // Reuse logic from useKanbanState if exposed, or duplicate small logic?
            // Let's assume the View passes the constructed params.

            const res = await fetch(`${API_URL}/extraction/preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    params: filters, // CAUTION: Validation needed
                    limit: quantity
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (res.status === 404 && data.message?.includes("0 results")) {
                toast.error("Nenhum resultado encontrado na busca.");
                setExtracting(false);
                setImportProgress(null);
                return;
            }

            setImportProgress(null);

            if (data.candidates && data.candidates.length > 0) {
                setCandidates(data.candidates);
                setReviewDialogOpen(true);
            } else {
                const scannedPages = data.pagesScanned || 0;
                const totalChecked = data.totalChecked || 0;
                const searchExhausted = data.searchExhausted || false;

                if (searchExhausted) {
                    toast.warning(`Busca Esgotada`, {
                        description: `Não há mais leads novos disponíveis. Analisamos ${scannedPages} páginas.`
                    });
                } else {
                    toast.info(`Nenhum lead novo encontrado`, {
                        description: `Analisamos ${totalChecked} leads e todos já constam na base.`
                    });
                }
                setExtracting(false);
            }

        } catch (err) {
            const errorMsg = err instanceof Error && err.name === 'AbortError'
                ? "Tempo limite excedido."
                : String(err);
            toast.error("Erro na busca", { description: errorMsg });
            setExtracting(false);
            setImportProgress(null);
        }
    };

    const confirmImport = async (selectedLeads: any[]) => {
        setIsConfirmingSave(true);
        try {
            const res = await fetch(`${API_URL}/leads/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedLeads)
            });

            if (res.ok) {
                const result = await res.json();
                const importedCount = result.count || selectedLeads.length;

                // Gamification
                addBulkImportXP(importedCount);

                toast.success(`Importado com sucesso!`, {
                    description: `${importedCount} leads novos foram adicionados.`
                });
                setReviewDialogOpen(false);
                setExtracting(false);
                fetchLeads(); // Refresh Context
            } else {
                throw new Error("Falha ao salvar lote");
            }
        } catch (err) {
            toast.error("Erro ao salvar leads", { description: String(err) });
        } finally {
            setIsConfirmingSave(false);
        }
    };

    const cancelImport = () => {
        setReviewDialogOpen(false);
        setExtracting(false);
        setCandidates([]);
    };

    return {
        extracting,
        importProgress,
        candidates,
        reviewDialogOpen,
        setReviewDialogOpen,
        startImport,
        confirmImport,
        cancelImport,
        isConfirmingSave
    };
}
