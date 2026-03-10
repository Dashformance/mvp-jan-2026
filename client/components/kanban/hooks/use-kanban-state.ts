"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from "sonner";
import { useGamification } from '@/hooks/useGamification';
import useSWRInfinite from 'swr/infinite';
import useSWR, { mutate } from 'swr';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

const API_URL = "/api";



const defaultFilters = {
    uf: [] as string[],
    municipio: '',
    bairro: '',
    cep: '',
    ddd: '',
    codigo_atividade_principal: '',
    codigo_atividade_secundaria: '',
    incluir_atividade_secundaria: false,
    situacao_cadastral: ['ATIVA'],
    matriz_filial: 'all' as 'all' | 'MATRIZ' | 'FILIAL',
    termo: '',
    tipo_busca: 'radical' as 'exata' | 'radical',
    buscar_razao_social: true,
    buscar_nome_fantasia: true,
    buscar_nome_socio: false,
    data_abertura_inicio: '',
    data_abertura_fim: '',
    ultimos_dias: '',
    capital_minimo: '',
    capital_maximo: '',
    mei_optante: false,
    mei_excluir: false,
    simples_optante: false,
    simples_excluir: false,
    com_email: false,
    com_telefone: false,
    somente_fixo: false,
    somente_celular: false,
    excluir_email_contab: true,
};

export function useKanbanState() {
    const [columns, setColumns] = useState<any[]>([]);
    const [filters, setFilters] = useState(defaultFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // Gamification Hook
    const { addXP } = useGamification();

    // Advanced FilterBar state
    const [filterBarState, setFilterBarState] = useState<{
        search?: string;
        status?: string[];
        owner?: string;
        source?: string[];
        city?: string;
        scoreMin?: number;
        scoreMax?: number;
        view?: 'mine' | 'all';
    }>({ view: 'mine' });

    const [sortBy, setSortBy] = useState<'status' | 'alpha' | 'date_asc' | 'date_desc' | 'score' | 'owner' | 'last_interaction'>('date_desc');
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    // UI State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedLeadForSheet, setSelectedLeadForSheet] = useState<any>(null);

    // SWR Infinite Implementation - Memoized getKey to prevent infinite loops
    const getKey = useCallback((pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.data?.length) return null;
        const limit = 50;
        let url = `${API_URL}/leads?page=${pageIndex + 1}&limit=${limit}`;

        if (filterBarState.search) url += `&search=${encodeURIComponent(filterBarState.search)}`;
        if (filterBarState.status && filterBarState.status.length > 0) url += `&status=${filterBarState.status.join(',')}`;
        if (filterBarState.source && filterBarState.source.length > 0) url += `&source=${filterBarState.source.join(',')}`;
        if (filterBarState.city) url += `&city=${encodeURIComponent(filterBarState.city)}`;
        if (filterBarState.scoreMin !== undefined) url += `&scoreMin=${filterBarState.scoreMin}`;
        if (filterBarState.scoreMax !== undefined) url += `&scoreMax=${filterBarState.scoreMax}`;
        if (filterBarState.view) url += `&view=${filterBarState.view}`;

        let sortField = 'date_added';
        let sortOrder = 'desc';
        if (sortBy === 'alpha') { sortField = 'trade_name'; sortOrder = 'asc'; }
        else if (sortBy === 'date_asc') { sortField = 'date_added'; sortOrder = 'asc'; }
        else if (sortBy === 'date_desc') { sortField = 'date_added'; sortOrder = 'desc'; }
        else if (sortBy === 'status') { sortField = 'status'; sortOrder = 'asc'; }
        else if (sortBy === 'score') { sortField = 'score'; sortOrder = 'desc'; }
        else if (sortBy === 'owner') { sortField = 'owner'; sortOrder = 'asc'; }
        else if (sortBy === 'last_interaction') { sortField = 'last_contact_date'; sortOrder = 'desc'; }

        url += `&sortBy=${sortField}&sortOrder=${sortOrder}`;
        return url;
    }, [filterBarState.search, filterBarState.status, filterBarState.source, filterBarState.city, filterBarState.scoreMin, filterBarState.scoreMax, filterBarState.view, sortBy]);


    const { data: pages, size, setSize, isValidating, isLoading: swrLoading, mutate: mutateLeads } = useSWRInfinite(
        getKey,
        (url) => fetchWithAuth(url).then(res => res.json()),
        {
            revalidateFirstPage: false,
            persistSize: true
        }
    );

    const leads = useMemo(() => pages ? pages.flatMap(p => p.data || []) : [], [pages]);
    const loading = !pages && swrLoading;
    const meta = useMemo(() => pages && pages.length > 0 ? (pages[pages.length - 1].meta || {}) : {}, [pages]);

    const loadMore = useCallback(async () => {
        if (isValidating || (meta.last_page && size >= meta.last_page)) return;
        setSize(size + 1);
    }, [size, meta.last_page, isValidating, setSize]);

    // Initial Fetch & Columns
    useEffect(() => {
        const init = async () => {
            // Fetch Stages
            try {
                const res = await fetch('/api/stages');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map((s: any) => {
                        return {
                            id: s.id, // Now uses ID instead of name as primary key
                            title: s.name, // Display name is now stored in name instead of phase
                            color: s.color || "bg-gray-500/10 text-gray-500 border-gray-500/20",
                            is_win_stage: s.is_win_stage,
                            is_lost_stage: s.is_lost_stage
                        };
                    });
                    setColumns(mapped);
                }
            } catch (err) {
                console.error("Failed to load stages", err);
            }

            // Fetch Leads
            mutateLeads();

            // Fetch Users
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                if (Array.isArray(data)) setAvailableUsers(data);
            } catch (err) {
                console.error("Failed to load users", err);
            }
        }
        init();

        const handleAddColumn = async (e: any) => {
            const name = e.detail?.name;
            if (!name) return;

            const tempId = crypto.randomUUID(); // optimistic random UUID
            const newCol = { id: tempId, title: name, color: "bg-gray-500/10 text-gray-500 border-gray-500/20", is_win_stage: false, is_lost_stage: false };

            // Optimistic
            setColumns(prev => [...prev, newCol]);

            try {
                const res = await fetch('/api/stages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }) // Only name now
                });
                if (!res.ok) throw new Error("Failed");

                // If we want to be fully correct, we should replace tempId with the real ID from DB here
                const data = await res.json();
                setColumns(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
                toast.success("Coluna criada com sucesso!");
            } catch (err) {
                toast.error("Erro ao criar coluna");
                // Revert optimization
                setColumns(prev => prev.filter(c => c.id !== tempId));
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('kanban:add-column', handleAddColumn);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('kanban:add-column', handleAddColumn);
            }
        };
    }, []);

    // Sync leads when params change - using stringified state to prevent object reference loops
    const filterBarStateKey = JSON.stringify(filterBarState);
    useEffect(() => {
        setSize(1);
        mutateLeads(); // Force revalidation without wiping slate
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterBarStateKey, sortBy]);

    const fetchLeads = useCallback(async (pageParam?: number) => {
        if (pageParam !== undefined) {
            setSize(pageParam);
        }
        await mutateLeads();
    }, [mutateLeads, setSize]);


    const updateLeadStatus = useCallback(async (id: string, newStatus: string) => {
        const previousData = pages;
        // Optimistic update via mutate
        mutateLeads(
            (prevPages: any[] | undefined) => {
                if (!prevPages) return prevPages;
                return prevPages.map(page => ({
                    ...page,
                    data: page.data.map((l: any) => l.id === id ? { ...l, status: newStatus } : l)
                }));
            },
            false // no revalidate immediately
        );

        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update");

            mutateLeads(undefined, true); // Always revalidate real data from server

            // Gamification Triggers
            if (newStatus === 'SOLD') {
                const result = addXP('LEAD_CONVERTED'); // Venda = 200 XP
                toast.success(`🥂 Negócio Fechado! +${result.xpGained} XP`);
            } else if (newStatus === 'MEETING') {
                const result = addXP('LEAD_QUALIFIED'); // Reunião = 100 XP
                toast.success(`📅 Reunião Agendada! +${result.xpGained} XP`);
            } else if (newStatus === 'CONTACTED') {
                addXP('LEAD_CONTACTED'); // Contato = 30 XP (Silencioso ou toast discreto?)
            }

            toast.success("Status atualizado");
        } catch (e: any) {
            toast.error("Erro ao atualizar status", { description: e.message || "Tente novamente." });
            mutateLeads(previousData, false); // ROLLBACK on error
        }
    }, [mutateLeads, addXP, pages]);

    const updateLead = useCallback(async (lead: any) => {
        try {
            const isNew = !lead.id || lead.id === 'new';
            const method = isNew ? 'POST' : 'PATCH';
            const url = isNew ? `${API_URL}/leads` : `${API_URL}/leads/${lead.id}`;

            const { id, ...leadData } = lead;
            const body = isNew ? leadData : lead;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const updated = await res.json();
                if (isNew) {
                    mutateLeads(); // Simpler to refetch for new items
                    const result = addXP('LEAD_CREATED');
                    toast.success(`Lead criado com sucesso! (+${result.xpGained} XP)`);
                } else {
                    mutateLeads(
                        (prevPages: any[] | undefined) => {
                            if (!prevPages) return prevPages;
                            return prevPages.map(page => ({
                                ...page,
                                data: page.data.map((l: any) => l.id === lead.id ? updated : l)
                            }));
                        },
                        false
                    );
                    toast.success("Lead atualizado");
                }
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown API error' }));
                console.error(`[API ERROR] Patch failed with status ${res.status}:`, errorData);
                throw new Error(errorData.error?.message || errorData.error || "Failed to update lead");
            }
        } catch (e: any) {
            toast.error(lead.id === 'new' ? "Erro ao criar lead" : `Erro ao atualizar lead: ${e.message}`);
            console.error(e);
        }
    }, [mutateLeads, addXP]);

    const toggleFavorite = useCallback(async (id: string, isStarred: boolean) => {
        // Optimistic
        mutateLeads(
            (prevPages: any[] | undefined) => {
                if (!prevPages) return prevPages;
                return prevPages.map(page => ({
                    ...page,
                    data: page.data.map((l: any) => l.id === id ? { ...l, is_starred: isStarred } : l)
                }));
            },
            false
        );

        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_starred: isStarred })
            });
            if (!res.ok) throw new Error("Falha");
            toast.success(isStarred ? "Lead favoritado!" : "Removido dos favoritos");
        } catch (e) {
            toast.error("Erro ao atualizar favorito");
            mutateLeads();
        }
    }, [mutateLeads]);

    const quickContact = useCallback(async (id: string) => {
        const now = new Date().toISOString();
        // Optimistic
        mutateLeads(
            (prevPages: any[] | undefined) => {
                if (!prevPages) return prevPages;
                return prevPages.map(page => ({
                    ...page,
                    data: page.data.map((l: any) => l.id === id ? { ...l, last_contact_date: now } : l)
                }));
            },
            false
        );

        try {
            const res = await fetch(`${API_URL}/interactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: id,
                    type: 'WHATSAPP',
                    content: 'Contato rápido registrado via Kanban (Hoje)',
                    date: now
                })
            });
            if (!res.ok) throw new Error("Falha ao registrar interação");

            const result = addXP('LEAD_CONTACTED');
            toast.success(`Interação registrada! (+${result.xpGained} XP)`);
        } catch (e) {
            toast.error("Erro ao registrar interação");
            mutateLeads();
        }
    }, [mutateLeads, addXP]);

    const deleteLead = useCallback(async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        const previousData = pages;
        try {
            // Optimistic Update with total_count decrement
            mutateLeads(
                (prevPages: any[] | undefined) => {
                    if (!prevPages) return prevPages;
                    return prevPages.map(page => ({
                        ...page,
                        data: page.data.filter((l: any) => l.id !== id),
                        meta: {
                            ...page.meta,
                            total: Math.max(0, (page.meta?.total || 0) - 1)
                        }
                    }));
                },
                false
            );

            await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
            setSelectedLeads(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            mutateLeads(); // force refetch
            toast.success("Lead excluído com sucesso");
        } catch (err: any) {
            mutateLeads(previousData, false);
            toast.error("Erro ao excluir lead", { description: err.message });
        }
    }, [mutateLeads, pages]);

    const updateMeetingType = useCallback(async (id: string, currentType: string) => {
        // Cycle: null -> FOLLOW_UP -> CONFIRMATION -> SCHEDULED -> null
        let nextType: string | null = null;
        if (!currentType) nextType = 'FOLLOW_UP';
        else if (currentType === 'FOLLOW_UP') nextType = 'CONFIRMATION';
        else if (currentType === 'CONFIRMATION') nextType = 'SCHEDULED';
        else nextType = null;

        // Optimistic update
        mutateLeads(
            (prevPages: any[] | undefined) => {
                if (!prevPages) return prevPages;
                return prevPages.map(page => ({
                    ...page,
                    data: page.data.map((l: any) => l.id === id ? { ...l, meeting_type: nextType } : l)
                }));
            },
            false
        );

        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meeting_type: nextType })
            });
            if (!res.ok) throw new Error("Failed");

            if (nextType) {
                const label = nextType === 'FOLLOW_UP' ? 'Follow Up Especial' :
                    nextType === 'CONFIRMATION' ? 'A Confirmar' : 'Confirmada';
                toast.success(`Status alterado para: ${label}`);
            } else {
                toast.info("Status de reunião resetado");
            }
        } catch (e: any) {
            toast.error("Erro ao atualizar status da reunião", { description: e.message });
            mutateLeads();
        }
    }, [mutateLeads]);

    const bulkUpdateLeads = useCallback(async (ids: string[], data: any) => {
        try {
            const res = await fetch(`${API_URL}/leads/batch`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, data })
            });

            if (res.ok) {
                toast.success(`${ids.length} leads atualizados com sucesso`);
                setSelectedLeads(new Set());
                mutateLeads(); // Forçar revalidação sem cache local wiped
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || "Falha na atualização em massa");
            }
        } catch (err: any) {
            toast.error("Erro ao atualizar leads em massa", { description: err.message });
        }
    }, [mutateLeads]);

    const toggleSelectLead = useCallback((id: string) => {
        setSelectedLeads(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectAllLeads = useCallback(() => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        }
    }, [selectedLeads.size, leads]);

    const clearSelection = useCallback(() => {
        setSelectedLeads(new Set());
    }, []);

    const cleanupDuplicates = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/leads/cleanup-duplicates`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                const count = data.deletedCount || 0;
                if (count > 0) {
                    toast.success(`Limpeza concluída!`, { description: `${count} leads duplicados movidos para lixeira.` });
                } else {
                    toast.info(`Nenhuma duplicata encontrada.`);
                }
                mutateLeads();
            } else {
                throw new Error("Falha ao limpar duplicatas");
            }
        } catch (error) {
            toast.error("Erro ao limpar duplicatas.");
        }
    }, [mutateLeads]);

    const deleteColumn = useCallback(async (columnId: string) => {
        try {
            const res = await fetch(`/api/stages/${columnId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Falha ao excluir coluna");
            }
            // Success
            setColumns(prev => prev.filter(c => c.id !== columnId));
            toast.success("Coluna excluída com sucesso");
        } catch (error: any) {
            toast.error(error.message);
        }
    }, []);

    const openLeadSheet = useCallback((lead?: any, defaultColumnId?: string) => {
        if (lead) {
            setSelectedLeadForSheet(lead);
        } else {
            const initialStatus = defaultColumnId || (columns.length > 0 ? columns[0].id : "NEW");
            // New Lead
            setSelectedLeadForSheet({
                id: "new",
                company_name: "",
                trade_name: "",
                cnpj: "",
                status: initialStatus, // Use actual column clicked instead of constant "NEW"
                source: "Manual",
                checklist: { hasInstagram: false, hasRender: false }
            });
        }
        setIsSheetOpen(true);
    }, [columns]);

    const closeLeadSheet = useCallback(() => {
        setIsSheetOpen(false);
        setSelectedLeadForSheet(null);
    }, []);

    return {
        leads,
        columns,
        setColumns,
        loading,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        updateLeadStatus,
        updateLead,
        toggleFavorite,
        quickContact,
        deleteLead,
        bulkUpdateLeads,
        updateMeetingType,
        selectedLeads,
        toggleSelectLead,
        selectAllLeads,
        clearSelection,
        meta,
        page: size,
        setPage: setSize,
        loadMore,
        filterBarState,
        setFilterBarState,
        sortBy,
        setSortBy,
        isSheetOpen,
        openLeadSheet,
        closeLeadSheet,
        selectedLeadForSheet,
        cleanupDuplicates,
        deleteColumn,
        availableUsers,
        fetchLeads
    };
}
