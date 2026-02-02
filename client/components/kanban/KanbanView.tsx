"use client";

import { useKanban } from "./kanban-context";
import { LeadsTable } from "../table/LeadsTable";
import { ConnectedKanbanBoard } from "./ConnectedKanbanBoard";
import { FilterBar } from "./FilterBar";
import { ActiveFilters } from "./ActiveFilters";
import { ViewToggle } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Download } from "lucide-react";
import { LeadSheet } from "../lead/LeadSheet";
import { ImportReviewDialog } from "../ImportReviewDialog";
import { TrashSheet } from "../TrashSheet";
import { deduplicateLeadsAction } from "@/app/actions/deduplicate-leads";
import { Eraser } from "lucide-react";
import { useLeadImport } from "./hooks/use-lead-import";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImportWizard } from "../import/ImportWizard";

export function KanbanView() {
    const {
        viewMode,
        setViewMode,
        leads,
        filterBarState,
        setFilterBarState,
        loading,
        fetchLeads,
        openLeadSheet,
        // Sheet State
        isSheetOpen,
        closeLeadSheet,
        selectedLeadForSheet,
        updateLead,
        // Actions
        selectedLeads,
        toggleSelectLead,
        selectAllLeads,
        updateLeadStatus,
        toggleFavorite,
        deleteLead,
        // Sort
        sortBy,
        setSortBy,
        loadMore,
        meta,
        page,
        filters: legacyFilters // Passing legacy filters to Import mostly (refactor needed)
    } = useKanban();

    // Import Hook
    const {
        extracting,
        importProgress,
        candidates,
        reviewDialogOpen,
        setReviewDialogOpen,
        startImport,
        confirmImport,
        cancelImport,
        isConfirmingSave
    } = useLeadImport();

    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [isDeduplicating, setIsDeduplicating] = useState(false);
    const [deduplicateConfirmOpen, setDeduplicateConfirmOpen] = useState(false);

    const handleDeduplicate = async () => {
        setIsDeduplicating(true);
        try {
            const result = await deduplicateLeadsAction();
            if (result.success && 'totalMerged' in result) {
                toast.success(`Limpeza concluída! ${result.totalMerged} leads duplicados foram mesclados.`);
                fetchLeads();
            } else if (result.success) {
                toast.success(`Limpeza concluída!`);
                fetchLeads();
            } else {
                toast.error(result.error || "Erro ao limpar duplicatas");
            }
        } catch (error) {
            toast.error("Erro inesperado ao limpar duplicatas");
        } finally {
            setIsDeduplicating(false);
            setDeduplicateConfirmOpen(false);
        }
    };

    const duplicateApiParams = (filters: any) => {
        // Replicating logic from page.tsx buildApiParams temporarily to enable import
        // Ideally this logic moves to a shared helper or context
        const params: any = {};
        if (filters.uf.length) params.uf = filters.uf;
        if (filters.municipio) params.municipio = [filters.municipio];
        if (filters.bairro) params.bairro = [filters.bairro];
        if (filters.cep) params.cep = [filters.cep];
        if (filters.ddd) params.ddd = [filters.ddd];
        if (filters.codigo_atividade_principal) params.codigo_atividade_principal = [filters.codigo_atividade_principal];
        if (filters.codigo_atividade_secundaria) params.codigo_atividade_secundaria = [filters.codigo_atividade_secundaria];
        if (filters.incluir_atividade_secundaria) params.incluir_atividade_secundaria = true;
        if (filters.situacao_cadastral.length) params.situacao_cadastral = filters.situacao_cadastral;
        if (filters.matriz_filial && filters.matriz_filial !== 'all') params.matriz_filial = filters.matriz_filial;
        if (filters.termo) {
            params.busca_textual = [{
                texto: [filters.termo],
                tipo_busca: filters.tipo_busca,
                razao_social: filters.buscar_razao_social,
                nome_fantasia: filters.buscar_nome_fantasia,
                nome_socio: filters.buscar_nome_socio
            }];
        }
        // ... Simplified, assumption is advanced filters are present in context
        return params;
    };

    // Memoized filter callbacks to prevent re-render loops
    const handleFilterChange = useCallback((f: any) => {
        setFilterBarState((prev: any) => ({ ...prev, ...f }));
    }, [setFilterBarState]);

    const handleClearAllFilters = useCallback(() => {
        setFilterBarState({});
    }, [setFilterBarState]);

    const handleRemoveFilter = useCallback((key: string, val?: any) => {
        setFilterBarState((prev: any) => {
            const next = { ...prev };
            if (key === 'status' || key === 'source') {
                const arr = next[key] as string[] || [];
                next[key] = arr.filter((v: string) => v !== val);
                if (next[key].length === 0) delete next[key];
            } else {
                delete next[key as keyof typeof next];
            }
            return next;
        });
    }, [setFilterBarState]);


    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <div className="h-6 w-px bg-white/10 mx-2" />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 bg-black/20 border-white/10 hover:bg-white/5"
                        onClick={() => fetchLeads()}
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    <TrashSheet
                        onRestore={() => fetchLeads()}
                        onDeleteForever={() => { }}
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 bg-black/20 border-white/10 hover:bg-white/5 gap-2"
                        onClick={() => setImportDialogOpen(true)}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Importar</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 bg-black/20 border-white/10 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 gap-2 transition-all"
                        onClick={() => setDeduplicateConfirmOpen(true)}
                    >
                        <Eraser className="w-4 h-4" />
                        <span className="hidden sm:inline">Limpar Duplicatas</span>
                    </Button>

                    <Button
                        size="sm"
                        className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-medium shadow-lg shadow-emerald-500/20"
                        onClick={() => openLeadSheet()}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Lead</span>
                    </Button>
                </div>
            </div>

            {/* Total Results Counter */}
            {viewMode === 'list' && meta?.total !== undefined && (
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#DECCA8]/50 px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Mostrando {leads.length} de {meta.total} leads encontrados
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2">
                            <RefreshCcw className="w-3 h-3 animate-spin" />
                            Atualizando...
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="space-y-4">
                <FilterBar
                    currentFilters={filterBarState}
                    onFilterChange={handleFilterChange}
                />
                <ActiveFilters
                    filters={filterBarState}
                    onClearAll={handleClearAllFilters}
                    onRemove={handleRemoveFilter}
                />
            </div>


            {/* Main Content */}
            <div className="flex-1 min-h-0 relative">
                {viewMode === 'kanban' ? (
                    <ConnectedKanbanBoard />
                ) : (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm custom-scrollbar pb-24 min-h-[1080px]">
                        <LeadsTable
                            leads={leads}
                            selectedLeads={selectedLeads}
                            onToggleSelect={toggleSelectLead}
                            onSelectAll={selectAllLeads}
                            onSort={(col) => setSortBy(col as any)}
                            sortBy={sortBy}
                            sortOrder={sortBy === 'alpha' ? 'asc' : 'desc'}
                            onEdit={openLeadSheet}
                            onDelete={deleteLead}
                            onStatusChange={updateLeadStatus}
                            onToggleFavorite={toggleFavorite}
                        />
                    </div>
                )}
            </div>

            {/* Pagination / Load More */}
            {viewMode === 'list' && meta?.last_page && page < meta.last_page && (
                <div className="flex justify-center pt-2 pb-8">
                    <Button
                        variant="ghost"
                        className="bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 px-8 py-6 rounded-2xl gap-3 transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-accent/5"
                        onClick={() => loadMore()}
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        )}
                        <span className="font-bold tracking-tight">Carregar mais leads</span>
                    </Button>
                </div>
            )}

            {/* Components */}
            <LeadSheet
                open={isSheetOpen}
                onOpenChange={(open) => !open && closeLeadSheet()}
                lead={selectedLeadForSheet}
                onSave={updateLead}
            />

            <ImportReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                candidates={candidates}
                onConfirm={confirmImport}
                onCancel={cancelImport}
                importing={isConfirmingSave}
            />

            {/* Import Wizard */}
            <ImportWizard
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
            />

            {/* Deduplication Confirmation */}
            <Dialog open={deduplicateConfirmOpen} onOpenChange={setDeduplicateConfirmOpen}>
                <DialogContent className="max-w-md bg-[#0D0D0D] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Eraser className="w-5 h-5 text-orange-500" />
                            Limpar Duplicatas de Leads
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <p className="text-white/70 text-sm leading-relaxed">
                            Esta ação irá identificar leads com o mesmo <span className="text-white font-bold">e-mail</span> e realizar um "Smart Merge":
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                Transfere todo o <span className="text-white">histórico de interações</span> para o lead principal.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                Completa campos vazios (telefone, redes sociais) do lead principal.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                Remove os leads duplicados (soft-delete).
                            </li>
                        </ul>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                            Dica: Recomendamos fazer isso periodicamente para manter seu CRM organizado.
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            className="hover:bg-white/5"
                            onClick={() => setDeduplicateConfirmOpen(false)}
                            disabled={isDeduplicating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                            onClick={handleDeduplicate}
                            disabled={isDeduplicating}
                        >
                            {isDeduplicating ? (
                                <>
                                    <RefreshCcw className="w-4 h-4 animate-spin mr-2" />
                                    Processando...
                                </>
                            ) : (
                                "Confirmar Limpeza"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
