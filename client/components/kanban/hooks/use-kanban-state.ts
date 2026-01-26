"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { PIPELINE_COLUMNS } from '../KanbanBoard';
import { useGamification } from '@/hooks/useGamification';

const API_URL = "/api";

export const STATUS_MAP: Record<string, { label: string, color: string }> = {
    INBOX: { label: 'Sem qualificação', color: 'bg-slate-500/20 text-slate-400 border border-slate-500/20' },
    NEW: { label: '✅ Qualificado (Vendas)', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' },
    ATTEMPTED: { label: 'Tentando Contato', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/20' },
    CONTACTED: { label: 'Contatado', color: 'bg-[#DECCA8]/20 text-[#DECCA8] border border-[#DECCA8]/20' },
    MEETING: { label: 'Reunião Agendada', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' },
    WON: { label: '💰 Em Fechamento', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
    SOLD: { label: '🥂 Negócio Fechado!', color: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' },
    LOST: { label: 'Perdido', color: 'bg-rose-400/15 text-rose-300 border border-rose-400/15' },
    DISQUALIFIED: { label: 'Desqualificado', color: 'bg-gray-500/20 text-gray-400 border border-zinc-500/20' },
};

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
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState(PIPELINE_COLUMNS);
    const [meta, setMeta] = useState<any>({});
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState(defaultFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

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

    const [sortBy, setSortBy] = useState<'status' | 'alpha' | 'date_asc' | 'date_desc' | 'score' | 'owner'>('date_desc');
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    // UI State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedLeadForSheet, setSelectedLeadForSheet] = useState<any>(null);

    const fetchLeads = useCallback(async (pageToFetch = 1, append = false) => {
        setLoading(true);
        try {
            const limit = 50;
            let url = `${API_URL}/leads?page=${pageToFetch}&limit=${limit}`;

            // Append Advanced Filters
            if (filterBarState.search) url += `&search=${encodeURIComponent(filterBarState.search)}`;
            if (filterBarState.status && filterBarState.status.length > 0) url += `&status=${filterBarState.status.join(',')}`;
            if (filterBarState.source && filterBarState.source.length > 0) url += `&source=${filterBarState.source.join(',')}`;
            if (filterBarState.city) url += `&city=${encodeURIComponent(filterBarState.city)}`;
            if (filterBarState.scoreMin !== undefined) url += `&scoreMin=${filterBarState.scoreMin}`;
            if (filterBarState.scoreMax !== undefined) url += `&scoreMax=${filterBarState.scoreMax}`;
            if (filterBarState.view) url += `&view=${filterBarState.view}`;

            // Sorting
            let sortField = 'date_added';
            let sortOrder = 'desc';

            if (sortBy === 'alpha') { sortField = 'trade_name'; sortOrder = 'asc'; }
            else if (sortBy === 'date_asc') { sortField = 'date_added'; sortOrder = 'asc'; }
            else if (sortBy === 'date_desc') { sortField = 'date_added'; sortOrder = 'desc'; }
            else if (sortBy === 'status') { sortField = 'status'; sortOrder = 'asc'; }
            else if (sortBy === 'score') { sortField = 'score'; sortOrder = 'desc'; }
            else if (sortBy === 'owner') { sortField = 'owner'; sortOrder = 'asc'; }

            url += `&sortBy=${sortField}&sortOrder=${sortOrder}`;

            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setLeads(prev => append ? [...prev, ...(data.data || [])] : (data.data || []));
                setMeta(data.meta || {});
                setPage(pageToFetch);
            } else {
                console.error("Fetch leads failed", data);
                setLeads([]);
            }
        } catch (err) {
            console.error("Failed to fetch leads", err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [filterBarState, sortBy]);

    const loadMore = useCallback(async () => {
        if (loading || (meta.last_page && page >= meta.last_page)) return;
        await fetchLeads(page + 1, true);
    }, [page, meta.last_page, loading, fetchLeads]);

    // Initial Fetch & Columns
    useEffect(() => {
        const init = async () => {
            // Fetch Stages
            try {
                const res = await fetch('/api/stages');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map((s: any) => {
                        // Force update title for WON if it's the old one
                        if (s.name === 'WON') {
                            return {
                                id: s.name,
                                title: '💰 Em Fechamento', // Force new title
                                color: s.color || "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            };
                        }
                        return {
                            id: s.name,
                            title: s.phase,
                            color: s.color || "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        };
                    });

                    // Hotfix: Ensure SOLD column exists if not present in DB
                    if (!mapped.find((c: any) => c.id === 'SOLD')) {
                        const successCol = PIPELINE_COLUMNS.find(c => c.id === 'SOLD');
                        if (successCol) {
                            const wonIndex = mapped.findIndex((c: any) => c.id === 'WON');
                            if (wonIndex !== -1) {
                                mapped.splice(wonIndex + 1, 0, successCol);
                            } else {
                                mapped.push(successCol);
                            }
                        }
                    }

                    setColumns(mapped);
                }
            } catch (err) {
                console.error("Failed to load stages", err);
            }

            // Fetch Leads
            await fetchLeads(1);
        }
        init();

        // Listen for Add Column Event
        const handleAddColumn = async (e: any) => {
            const name = e.detail?.name;
            if (!name) return;

            const tempId = name.toUpperCase().replace(/\s+/g, '_');
            const newCol = { id: tempId, title: name, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" };

            // Optimistic
            setColumns(prev => [...prev, newCol]);

            try {
                const res = await fetch('/api/stages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: tempId, phase: name })
                });
                if (!res.ok) throw new Error("Failed");
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

    // Sync leads when params change
    useEffect(() => {
        fetchLeads(page);
    }, [filterBarState, sortBy, page]);


    const updateLeadStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update");

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
        } catch (e) {
            toast.error("Erro ao atualizar status");
            fetchLeads(page); // Revert on error by refetching
        }
    };

    const updateLead = async (lead: any) => {
        try {
            const isNew = !lead.id || lead.id === 'new';
            const method = isNew ? 'POST' : 'PATCH';
            const url = isNew ? `${API_URL}/leads` : `${API_URL}/leads/${lead.id}`;

            // Remove 'id' if it is 'new' to avoid sending it to backend if backend doesn't like it, 
            // though Prisma usually ignores ID on create if strictly typed, but safer to clean.
            // But if we used 'new' as ID for UI, we should cleanup.
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
                    setLeads(prev => [updated, ...prev]);
                    const result = addXP('LEAD_CREATED');
                    toast.success(`Lead criado com sucesso! (+${result.xpGained} XP)`);
                } else {
                    setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                    toast.success("Lead atualizado");
                    // Also update status if changed during edit
                    if (updated.status && updated.status !== lead.status) {
                        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: updated.status } : l));
                    }
                }
            } else {
                throw new Error("Failed");
            }
        } catch (e) {
            toast.error(lead.id === 'new' ? "Erro ao criar lead" : "Erro ao atualizar lead");
            console.error(e);
        }
    };

    const toggleFavorite = async (id: string, isStarred: boolean) => {
        // Optimistic
        setLeads(prev => prev.map(l => l.id === id ? { ...l, is_starred: isStarred } : l));
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
            fetchLeads(page);
        }
    };

    const quickContact = async (id: string) => {
        const now = new Date().toISOString();
        // Optimistic
        setLeads(prev => prev.map(l => l.id === id ? { ...l, last_contact_date: now } : l));

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
            fetchLeads(page);
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
            setLeads(prev => prev.filter((l: any) => l.id !== id));
            setSelectedLeads(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.success("Lead excluído com sucesso");
        } catch (err) {
            toast.error("Erro ao excluir lead");
        }
    };

    const bulkUpdateLeads = async (ids: string[], data: any) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/leads/batch`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, data })
            });

            if (res.ok) {
                toast.success(`${ids.length} leads atualizados com sucesso`);
                // Optimistic update
                setLeads(prev => prev.map(l => ids.includes(l.id) ? { ...l, ...data } : l));
                setSelectedLeads(new Set());
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.error("Erro ao atualizar leads em massa");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectLead = (id: string) => {
        setSelectedLeads(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllLeads = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        }
    };

    const cleanupDuplicates = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/leads/cleanup-duplicates`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                const count = data.deletedCount || 0;
                if (count > 0) {
                    toast.success(`Limpeza concluída!`, { description: `${count} leads duplicados movidos para lixeira.` });
                } else {
                    toast.info(`Nenhuma duplicata encontrada.`);
                }
                fetchLeads(page);
            } else {
                throw new Error("Falha ao limpar duplicatas");
            }
        } catch (error) {
            toast.error("Erro ao limpar duplicatas.");
        } finally {
            setLoading(false);
        }
    };

    const openLeadSheet = (lead?: any) => {
        if (lead) {
            setSelectedLeadForSheet(lead);
        } else {
            // New Lead
            setSelectedLeadForSheet({
                id: "new",
                company_name: "",
                trade_name: "",
                cnpj: "",
                status: "NEW", // Default
                source: "Manual",
                checklist: { hasInstagram: false, hasRender: false }
            });
        }
        setIsSheetOpen(true);
    };

    const closeLeadSheet = () => {
        setIsSheetOpen(false);
        setSelectedLeadForSheet(null);
    };

    return {
        leads,
        setLeads,
        columns,
        setColumns,
        loading,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        fetchLeads,
        updateLeadStatus,
        updateLead,
        toggleFavorite,
        quickContact,
        deleteLead,
        bulkUpdateLeads,
        selectedLeads,
        toggleSelectLead,
        selectAllLeads,
        meta,
        page,
        setPage,
        loadMore,
        filterBarState,
        setFilterBarState,
        sortBy,
        setSortBy,
        isSheetOpen,
        openLeadSheet,
        closeLeadSheet,
        selectedLeadForSheet,
        cleanupDuplicates
    };
}
