"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, RefreshCcw, Search, X, LayoutGrid, List as ListIcon, Check, Filter, Calendar, Users, Briefcase, MapPin, Target, Database, Download, Mail, Phone, ExternalLink, ArrowRight, Loader2, Globe, Sparkles, Split, ChevronDown, BarChart3, LogOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { KanbanBoard, TRIAGEM_COLUMNS, PIPELINE_COLUMNS } from "@/components/kanban/KanbanBoard";
import { LeadSheet } from "@/components/lead/LeadSheet";
import { TrashSheet } from "@/components/TrashSheet";
import { ImportReviewDialog } from "@/components/ImportReviewDialog";
import { UserSelector } from "@/components/layout/UserSelector";
import Link from 'next/link';
import { toast } from "sonner";

export const API_URL = "/api";

// DS v3.1 Semantic Status Colors
// DS v3.1 Semantic Status Colors
const STATUS_MAP: Record<string, { label: string, color: string }> = {
  NEW: { label: 'Novo', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' },
  ATTEMPTED: { label: 'Tentando Contato', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/20' },
  CONTACTED: { label: 'Contatado', color: 'bg-[#DECCA8]/20 text-[#DECCA8] border border-[#DECCA8]/20' },
  MEETING: { label: 'Reunião Agendada', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' },
  WON: { label: 'Ganho / Fechado', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
  LOST: { label: 'Perdido / Descartado', color: 'bg-rose-400/15 text-rose-300 border border-rose-400/15' },
  DISQUALIFIED: { label: 'Desqualificado', color: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/20' },
};

const UF_OPTIONS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const SITUACAO_OPTIONS = [
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'BAIXADA', label: 'Baixada' },
  { value: 'SUSPENSA', label: 'Suspensa' },
  { value: 'INAPTA', label: 'Inapta' },
  { value: 'NULA', label: 'Nula' },
];

// Default empty advanced filter state
const defaultFilters = {
  // Localização
  uf: [] as string[],
  municipio: '',
  bairro: '',
  cep: '',
  ddd: '',

  // Atividade
  codigo_atividade_principal: '',
  codigo_atividade_secundaria: '',
  incluir_atividade_secundaria: false,

  // Situação
  situacao_cadastral: ['ATIVA'],
  matriz_filial: 'all' as 'all' | 'MATRIZ' | 'FILIAL',

  // Busca Textual
  termo: '',
  tipo_busca: 'radical' as 'exata' | 'radical',
  buscar_razao_social: true,
  buscar_nome_fantasia: true,
  buscar_nome_socio: false,

  // Datas
  data_abertura_inicio: '',
  data_abertura_fim: '',
  ultimos_dias: '',

  // Capital
  capital_minimo: '',
  capital_maximo: '',

  // Regime
  mei_optante: false,
  mei_excluir: false,
  simples_optante: false,
  simples_excluir: false,

  // Extras
  com_email: false,
  com_telefone: false,
  somente_fixo: false,
  somente_celular: false,
  excluir_email_contab: true,
};

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [extracting, setExtracting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    status: string;
    stage: number;
    scanned?: number;
    checked?: number;
  } | null>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [importQuantity, setImportQuantity] = useState("10");
  const [searchResults, setSearchResults] = useState<{ total: number, leads: any[] } | null>(null);

  // Multi-select state
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Lead Management State
  const [selectedLeadForSheet, setSelectedLeadForSheet] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAddNewLead = () => {
    setSelectedLeadForSheet({
      id: "new",
      company_name: "",
      trade_name: "",
      cnpj: "",
      status: "NEW",
      owner: currentUser,
      source: "Manual",
      checklist: { hasInstagram: false, hasRender: false }
    });
    setIsSheetOpen(true);
  };

  const handleSaveLead = async (updatedLead: any) => {
    setLoading(true);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      if (updatedLead.id === 'new') {
        const { id, ...saveData } = updatedLead;
        const res = await fetch(`${API_URL}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || errData.error?.details || errData.message || 'Falha ao criar lead';
          throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }
        toast.success('Lead criado com sucesso!');
      } else {
        const res = await fetch(`${API_URL}/leads/${updatedLead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLead),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || errData.error?.details || errData.message || 'Falha ao atualizar lead';
          throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }
        toast.success('Lead atualizado!');
      }
      await fetchLeads(page);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[handleSaveLead] Error:', error);
      if (error.name === 'AbortError') {
        toast.error('⏱️ Tempo esgotado. Servidor não respondeu em 30 segundos.');
      } else {
        toast.error(error.message || 'Erro ao salvar lead');
      }
    } finally {
      setLoading(false);
    }
  };

  // Alias for compatibility if needed
  const handleSheetSave = handleSaveLead;

  // Multi-user & View State
  const [currentUser, setCurrentUser] = useState<string>('joao');
  const [filterMyLeads, setFilterMyLeads] = useState(true);
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [pipelineTab, setPipelineTab] = useState<'triagem' | 'pipeline'>('pipeline');
  const [sortBy, setSortBy] = useState<'status' | 'alpha' | 'date_asc' | 'date_desc'>('date_desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load user preference
  useEffect(() => {
    const savedUser = localStorage.getItem('dashformance_user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleUserChange = (u: string) => {
    setCurrentUser(u);
    localStorage.setItem('dashformance_user', u);
    toast.info(`Perfil alterado para: ${u === 'joao' ? 'João' : 'Vitor Nitz'}`);
  };

  const handleLogout = () => {
    document.cookie = "dashformance_v5_access=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem('lead_extractor_user');
    localStorage.removeItem('dashformance_user');
    window.location.href = "/login";
  };

  // Owner counts for smart filter (Total from database)
  const ownerCounts = {
    all: meta.total || 0,
    joao: meta.joaoTotal || 0,
    vitor: meta.vitorTotal || 0,
    unassigned: meta.unassignedTotal || 0,
  };

  // Status order for sorting
  const STATUS_ORDER = ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'LOST'];

  const displayedLeads = leads
    .filter(l => {
      // Owner filter
      if (filterMyLeads && !(l.owner === currentUser || !l.owner)) return false;
      if (!filterMyLeads && filterOwner === 'joao' && !(l.owner === 'joao' || !l.owner)) return false;
      if (!filterMyLeads && filterOwner === 'vitor' && l.owner !== 'vitor') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (l.trade_name || l.company_name || '').toLowerCase().includes(q);
        const matchEmail = (l.email || '').toLowerCase().includes(q);
        const matchPhone = (l.phone || '').includes(q);
        const matchCnpj = (l.cnpj || '').includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCnpj) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alpha':
          return (a.trade_name || a.company_name || '').localeCompare(b.trade_name || b.company_name || '');
        case 'status':
          return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        case 'date_asc':
          return new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
        case 'date_desc':
        default:
          return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
      }
    });

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Lead Division State
  const [divideDialogOpen, setDivideDialogOpen] = useState(false);
  const [divideSource, setDivideSource] = useState<'unassigned' | 'joao' | 'vitor'>('unassigned');
  const [leadsCountToDivide, setLeadsCountToDivide] = useState(0);
  const [divideSliderValue, setDivideSliderValue] = useState(50);

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  // Recalculate counts when division source changes
  useEffect(() => {
    if (divideDialogOpen) {
      let count = 0;
      if (divideSource === 'unassigned') count = ownerCounts.unassigned;
      else if (divideSource === 'joao') count = ownerCounts.joao - ownerCounts.unassigned; // joao only (excluding unassigned)
      else if (divideSource === 'vitor') count = ownerCounts.vitor;
      setLeadsCountToDivide(count);
      setDivideSliderValue(Math.floor(count / 2));
    }
  }, [divideSource, divideDialogOpen, ownerCounts.unassigned, ownerCounts.joao, ownerCounts.vitor]);

  const fetchLeads = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leads?page=${pageToFetch}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.data || []);
        setMeta(data.meta || {});
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
  };

  const buildApiParams = () => {
    const params: any = {};

    // Localização
    if (filters.uf.length) params.uf = filters.uf;
    if (filters.municipio) params.municipio = [filters.municipio];
    if (filters.bairro) params.bairro = [filters.bairro];
    if (filters.cep) params.cep = [filters.cep];
    if (filters.ddd) params.ddd = [filters.ddd];

    // Atividade
    if (filters.codigo_atividade_principal) {
      params.codigo_atividade_principal = [filters.codigo_atividade_principal];
    }
    if (filters.codigo_atividade_secundaria) {
      params.codigo_atividade_secundaria = [filters.codigo_atividade_secundaria];
    }
    if (filters.incluir_atividade_secundaria) {
      params.incluir_atividade_secundaria = true;
    }

    // Situação
    if (filters.situacao_cadastral.length) {
      params.situacao_cadastral = filters.situacao_cadastral;
    }
    if (filters.matriz_filial && filters.matriz_filial !== 'all') {
      params.matriz_filial = filters.matriz_filial;
    }

    // Busca Textual
    if (filters.termo) {
      params.busca_textual = [{
        texto: [filters.termo],
        tipo_busca: filters.tipo_busca,
        razao_social: filters.buscar_razao_social,
        nome_fantasia: filters.buscar_nome_fantasia,
        nome_socio: filters.buscar_nome_socio
      }];
    }

    // Datas
    if (filters.data_abertura_inicio || filters.data_abertura_fim || filters.ultimos_dias) {
      params.data_abertura = {};
      if (filters.data_abertura_inicio) params.data_abertura.inicio = filters.data_abertura_inicio;
      if (filters.data_abertura_fim) params.data_abertura.fim = filters.data_abertura_fim;
      if (filters.ultimos_dias) params.data_abertura.ultimos_dias = Number(filters.ultimos_dias);
    }

    // Capital
    if (filters.capital_minimo || filters.capital_maximo) {
      params.capital_social = {};
      if (filters.capital_minimo) params.capital_social.minimo = Number(filters.capital_minimo);
      if (filters.capital_maximo) params.capital_social.maximo = Number(filters.capital_maximo);
    }

    // Regime
    if (filters.mei_optante || filters.mei_excluir) {
      params.mei = {
        optante: filters.mei_optante,
        excluir_optante: filters.mei_excluir
      };
    }
    if (filters.simples_optante || filters.simples_excluir) {
      params.simples = {
        optante: filters.simples_optante,
        excluir_optante: filters.simples_excluir
      };
    }

    // Extras
    if (filters.com_email) params.com_email = true;
    if (filters.com_telefone) params.com_telefone = true;
    if (filters.somente_fixo) params.somente_fixo = true;
    if (filters.somente_celular) params.somente_celular = true;
    if (filters.excluir_email_contab) params.excluir_email_contab = true;

    return params;
  };

  const handleSearch = async () => {
    setExtracting(true);
    setSearchResults(null);
    try {
      const res = await fetch(`${API_URL}/extraction/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: buildApiParams() })
      });
      const data = await res.json();
      const rawLeads = data.cnpjs || data.leads || [];
      const total = data.total || data.count || rawLeads.length;
      setSearchResults({ total, leads: rawLeads });
    } catch (err) {
      toast.error("Falha na busca", { description: String(err) });
    } finally {
      setExtracting(false);
    }
  };


  const handleCleanupDuplicates = () => {
    setCleanupDialogOpen(true);
  };

  const performCleanupDuplicates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/leads/cleanup-duplicates`, {
        method: 'POST'
      });
      const data = await res.json();

      if (res.ok) {
        const count = data.deletedCount || 0;
        if (count > 0) {
          toast.success(`✨ Limpeza Concluída!`, {
            description: `${count} lead${count > 1 ? 's duplicados foram movidos' : ' duplicado foi movido'} para a lixeira.`,
            duration: 5000,
          });
        } else {
          toast.info(`Nenhuma duplicata encontrada`, {
            description: `Todos os leads são únicos. Base de dados já está limpa!`,
            duration: 4000,
          });
        }
        fetchLeads(); // Refresh list
        setCleanupDialogOpen(false);
      } else {
        throw new Error("Falha ao limpar duplicatas");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao limpar duplicatas.");
    } finally {
      setLoading(false);
    }
  };

  // Lead Division
  const openDivideDialog = () => {
    setDivideSource('unassigned'); // Reset to default
    setDivideDialogOpen(true);
  };

  const performDivideLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/leads/divide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joaoCount: divideSliderValue,
          sourceOwner: divideSource
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`⚡ Leads Divididos!`, {
          description: `João: ${data.joaoCount} leads | Vitor: ${data.vitorCount} leads`,
          duration: 5000,
        });
        fetchLeads();
        setDivideDialogOpen(false);
      } else {
        throw new Error("Falha ao dividir leads");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao dividir leads.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignOwner = async (owner: string) => {
    if (selectedLeads.size === 0) return;

    // Convert string 'null' to actual null for the API or handle appropriately
    const targetOwner = owner === 'null' ? null : owner;

    try {
      await fetch(`${API_URL}/leads/batch/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedLeads),
          data: { owner: targetOwner }
        })
      });
      const count = selectedLeads.size;
      setSelectedLeads(new Set());
      fetchLeads(page);

      const ownerLabel = targetOwner === 'joao' ? 'João' : (targetOwner === 'vitor' ? 'Vitor' : 'ninguém');
      toast.success(`${count} leads atribuídos para ${ownerLabel}`);
    } catch (err) {
      toast.error("Erro ao atribuir responsável");
    }
  };

  const handleImport = async () => {
    setExtracting(true);
    const targetQuantity = Number(importQuantity);
    setImportProgress({ current: 0, total: targetQuantity, status: 'Iniciando extração...', stage: 0 });

    try {
      setImportProgress({ current: 0, total: targetQuantity, status: 'Conectando à Casa dos Dados...', stage: 1 });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      // Use PREVIEW endpoint first
      const res = await fetch(`${API_URL}/extraction/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          params: buildApiParams(),
          limit: targetQuantity
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
        // Handle empty or exhausted
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

  const handleConfirmImport = async (selectedLeads: any[]) => {
    setIsConfirmingSave(true);
    try {
      const res = await fetch(`${API_URL}/leads/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedLeads)
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Importado com sucesso!`, {
          description: `${result.count} leads novos foram adicionados.`
        });
        setReviewDialogOpen(false);
        setExtracting(false);
        fetchLeads(page);
      } else {
        throw new Error("Falha ao salvar lote");
      }
    } catch (err) {
      toast.error("Erro ao salvar leads", { description: String(err) });
    } finally {
      setIsConfirmingSave(false);
    }
  };

  const handleCancelImport = () => {
    setReviewDialogOpen(false);
    setExtracting(false);
    setCandidates([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter((l: any) => l.id !== id));
      setSelectedLeads(prev => { prev.delete(id); return new Set(prev); });
      toast.success("Lead excluído com sucesso");
    } catch (err) {
      toast.error("Erro ao excluir lead");
    }
  };

  const handleKanbanUpdate = async (id: string, newStatus: string) => {
    // Optimistic update
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      await fetch(`${API_URL}/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success("Status atualizado");
    } catch (e) {
      toast.error("Erro ao atualizar status");
      fetchLeads(page); // Revert on error
    }
  };

  // Alias for inline status change in list view
  const handleStatusChange = handleKanbanUpdate;



  const openLeadSheet = (lead: any) => {
    setSelectedLeadForSheet(lead);
    setIsSheetOpen(true);
  };

  // Multi-select functions
  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllLeads = () => {
    if (selectedLeads.size === displayedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(displayedLeads.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    setDeleteDialogOpen(true);
  };

  const performBulkDelete = async () => {
    try {
      await fetch(`${API_URL}/leads/batch/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedLeads) })
      });
      const count = selectedLeads.size;
      setSelectedLeads(new Set());
      setDeleteDialogOpen(false);
      fetchLeads(page);
      toast.success(`${count} leads excluídos com sucesso`);
    } catch (err) {
      toast.error("Erro ao excluir em lote");
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedLeads.size === 0) return;

    try {
      await fetch(`${API_URL}/leads/batch/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedLeads), data: { status } })
      });
      const count = selectedLeads.size;
      setSelectedLeads(new Set());
      fetchLeads(page);
      toast.success(`${count} leads atualizados para "${STATUS_MAP[status]?.label || status}"`);
    } catch (err) {
      toast.error("Erro ao atualizar em lote");
    }
  };

  const toggleUf = (uf: string) => {
    setFilters(f => ({
      ...f,
      uf: f.uf.includes(uf) ? f.uf.filter(u => u !== uf) : [...f.uf, uf]
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-6 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              <span className="text-[#8A8A8A]">DASH</span>
              <span className="bg-linear-to-r from-[#E8D8B8] to-[#C8AC8C] bg-clip-text text-transparent">FORMANCE</span>
            </h1>
            <p className="text-[#6B6B6B] text-sm">Gestão de Leads de Alta Performance</p>
          </div>
          <div className="flex items-center gap-4">


            <UserSelector currentUser={currentUser} onChange={handleUserChange} />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline" className="border-[#DECCA8]/30 text-[#DECCA8] hover:bg-[#DECCA8]/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleCleanupDuplicates}
                disabled={loading}
                className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                title="Detectar e remover duplicatas antigas preservando anotações"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Limpar Duplicatas
              </Button>
              <Button
                variant="outline"
                onClick={openDivideDialog}
                disabled={loading}
                className="border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                title="Dividir leads sem responsável entre João e Vitor"
              >
                <Split className="w-4 h-4 mr-2" />
                Dividir Leads
              </Button>
              <Button variant="outline" onClick={() => fetchLeads(page)} disabled={loading}>
                <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <TrashSheet
                onRestore={() => fetchLeads(page)}
                onDeleteForever={() => { }}
              />

              <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#181818] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Limpar Duplicatas
                    </DialogTitle>
                    <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                      Esta ação irá buscar e remover leads duplicados baseados em <strong>Email</strong> e <strong>Telefone</strong>.
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Leads com anotações serão <strong>preservados</strong>.</li>
                        <li>Se não houver anotações, o registro mais antigo será mantido.</li>
                        <li>Duplicatas removidas irão para a Lixeira.</li>
                      </ul>
                    </div>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setCleanupDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={performCleanupDuplicates}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Confirmar Limpeza
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Divide Leads Dialog */}
              <Dialog open={divideDialogOpen} onOpenChange={setDivideDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#181818] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Split className="w-5 h-5 text-cyan-500" />
                      Dividir Leads
                    </DialogTitle>
                    <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                      Distribua os leads sem responsável entre você e seu sócio.
                    </div>
                  </DialogHeader>

                  <div className="py-6 space-y-6">
                    {/* Source Selector */}
                    <div className="flex p-1 bg-white/5 rounded-lg">
                      <button
                        onClick={() => setDivideSource('unassigned')}
                        className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-all ${divideSource === 'unassigned' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-muted-foreground hover:text-white'}`}
                      >
                        Sem Dono
                      </button>
                      <button
                        onClick={() => setDivideSource('joao')}
                        className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-all ${divideSource === 'joao' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-muted-foreground hover:text-white'}`}
                      >
                        Do João
                      </button>
                      <button
                        onClick={() => setDivideSource('vitor')}
                        className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-all ${divideSource === 'vitor' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-muted-foreground hover:text-white'}`}
                      >
                        Do Vitor
                      </button>
                    </div>

                    <div className="text-center">
                      <span className="text-muted-foreground text-sm">Leads Disponíveis:</span>
                      <span className="ml-2 text-2xl font-bold text-white">{leadsCountToDivide}</span>
                    </div>

                    {leadsCountToDivide > 0 ? (
                      <>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-cyan-400 font-medium">João: {divideSliderValue}</span>
                            <span className="text-[#DECCA8] font-medium">Vitor: {leadsCountToDivide - divideSliderValue}</span>
                          </div>
                          <Slider
                            value={[divideSliderValue]}
                            onValueChange={(v) => setDivideSliderValue(v[0])}
                            max={leadsCountToDivide}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>{Math.floor(leadsCountToDivide / 2)}</span>
                            <span>{leadsCountToDivide}</span>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 text-xs text-muted-foreground">
                          💡 Os leads serão distribuídos aleatoriamente para garantir fairness.
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Nenhum lead encontrado nesta categoria.
                      </div>
                    )}
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setDivideDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={performDivideLeads}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      disabled={loading || leadsCountToDivide === 0}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Dividir Agora
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Bulk Action Bar */}
              {selectedLeads.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1C1C1C] border-2 border-[#DECCA8]/50 rounded-full shadow-[0_0_30px_rgba(222,204,168,0.15)] p-2 px-6 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 border-r border-[#DECCA8]/20 pr-6 mr-2">
                    <span className="text-sm font-medium text-white">{selectedLeads.size} selecionados</span>
                    <button onClick={() => setSelectedLeads(new Set())} className="text-xs text-muted-foreground hover:text-white transition-colors">
                      Limpar
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Change Status */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 border border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 rounded-full px-4">
                          <RefreshCcw className="w-3.5 h-3.5" />
                          <span className="text-xs">Mudar Status</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="bg-[#1C1C1C] border-white/10">
                        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                          <DropdownMenuItem key={key} onClick={() => handleBulkStatusChange(key)} className="text-white hover:bg-white/10">
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Assign Owner */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 border border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 rounded-full px-4">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-xs">Responsável</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="bg-[#1C1C1C] border-white/10">
                        <DropdownMenuItem onClick={() => handleBulkAssignOwner('joao')} className="text-white hover:bg-white/10">
                          Atribuir para João
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAssignOwner('vitor')} className="text-white hover:bg-white/10">
                          Atribuir para Vitor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAssignOwner('null')} className="text-red-400 hover:bg-red-500/10 focus:text-red-400">
                          Remover Responsável
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="h-9 px-4 rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs">Excluir</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Dialog */}
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#181818] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      Confirmar Exclusão
                    </DialogTitle>
                    <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                      Você está prestes a mover <strong className="text-white">{selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''}</strong> para a lixeira.
                      <p className="mt-2 text-xs opacity-70">Esta ação pode ser revertida através da Lixeira.</p>
                    </div>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={performBulkDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Excluir {selectedLeads.size} Lead{selectedLeads.size > 1 ? 's' : ''}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Search className="w-4 h-4 mr-2" /> Pesquisa Avançada
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[95vw] lg:max-w-[1400px] w-full max-h-[95vh] flex flex-col p-0 gap-0 bg-[#181818] border-white/10 text-white overflow-hidden shadow-2xl rounded-2xl">
                  <DialogHeader className="p-6 pb-4 shrink-0 border-b border-white/5 bg-[#1c1c1c]/30">
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <Search className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="flex flex-col">
                        <span>Pesquisa Avançada</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal mt-0.5">Casa dos Dados API v5</span>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col lg:flex-row h-full w-full divide-x divide-white/5">
                      {/* Left Column: Filters */}
                      <div className="w-full lg:w-[450px] shrink-0 overflow-y-auto px-8 py-8 space-y-8 scroller custom-scrollbar bg-[#1c1c1c]/20">
                        <div className="space-y-1 mb-2">
                          <h3 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em]">Parâmetros de Filtro</h3>
                          <p className="text-[11px] text-muted-foreground">Refine sua busca para leads qualificados</p>
                        </div>
                        <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="localizacao">

                          {/* Localização */}
                          <AccordionItem value="localizacao" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              📍 Localização
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-5 animate-in slide-in-from-top-2">
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 block">Estados (UF)</Label>
                                <div className="flex flex-wrap gap-2">
                                  {UF_OPTIONS.map(uf => (
                                    <Badge
                                      key={uf}
                                      variant="outline"
                                      className={`cursor-pointer h-8 px-3 transition-all ${filters.uf.includes(uf)
                                        ? "bg-white text-black border-white hover:bg-white/90"
                                        : "bg-transparent text-muted-foreground border-white/10 hover:bg-white/5 hover:text-white"
                                        }`}
                                      onClick={() => toggleUf(uf)}
                                    >
                                      {uf}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Município</Label>
                                  <Input
                                    placeholder="balneario camboriu"
                                    value={filters.municipio}
                                    onChange={e => setFilters({ ...filters, municipio: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Bairro</Label>
                                  <Input
                                    placeholder="centro"
                                    value={filters.bairro}
                                    onChange={e => setFilters({ ...filters, bairro: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">CEP</Label>
                                  <Input
                                    placeholder="88330000"
                                    value={filters.cep}
                                    onChange={e => setFilters({ ...filters, cep: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">DDD</Label>
                                  <Input
                                    placeholder="47"
                                    value={filters.ddd}
                                    onChange={e => setFilters({ ...filters, ddd: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Atividade Econômica */}
                          <AccordionItem value="atividade" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              🏢 Atividade Econômica (CNAE)
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">CNAE Principal</Label>
                                  <Input
                                    placeholder="Ex: 4120400 (Construção)"
                                    value={filters.codigo_atividade_principal}
                                    onChange={e => setFilters({ ...filters, codigo_atividade_principal: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">CNAE Secundário</Label>
                                  <Input
                                    placeholder="Ex: 4110700"
                                    value={filters.codigo_atividade_secundaria}
                                    onChange={e => setFilters({ ...filters, codigo_atividade_secundaria: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                  id="incluir_secundaria"
                                  checked={filters.incluir_atividade_secundaria}
                                  onCheckedChange={(c) => setFilters({ ...filters, incluir_atividade_secundaria: !!c })}
                                  className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                />
                                <label htmlFor="incluir_secundaria" className="text-sm text-muted-foreground">
                                  Incluir atividades secundárias na busca
                                </label>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Situação */}
                          <AccordionItem value="situacao" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              📊 Situação da Empresa
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-5 animate-in slide-in-from-top-2">
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 block">Situação Cadastral</Label>
                                <div className="flex flex-wrap gap-2">
                                  {SITUACAO_OPTIONS.map(opt => (
                                    <Badge
                                      key={opt.value}
                                      variant="outline"
                                      className={`cursor-pointer h-8 px-3 transition-all ${filters.situacao_cadastral.includes(opt.value)
                                        ? "bg-white text-black border-white hover:bg-white/90"
                                        : "bg-transparent text-muted-foreground border-white/10 hover:bg-white/5 hover:text-white"
                                        }`}
                                      onClick={() => {
                                        const has = filters.situacao_cadastral.includes(opt.value);
                                        setFilters({
                                          ...filters,
                                          situacao_cadastral: has
                                            ? filters.situacao_cadastral.filter(s => s !== opt.value)
                                            : [...filters.situacao_cadastral, opt.value]
                                        });
                                      }}
                                    >
                                      {opt.label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Tipo (Matriz/Filial)</Label>
                                <Select value={filters.matriz_filial} onValueChange={(v: any) => setFilters({ ...filters, matriz_filial: v })}>
                                  <SelectTrigger className="h-10 bg-[#222222] border-white/10 text-white">
                                    <SelectValue placeholder="Todos (Matriz + Filial)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="MATRIZ">Somente Matriz</SelectItem>
                                    <SelectItem value="FILIAL">Somente Filial</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Busca Textual */}
                          <AccordionItem value="textual" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              🔍 Busca Textual
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2">
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Termo de Busca</Label>
                                <Input
                                  placeholder="Ex: construtora, tecnologia, advocacia..."
                                  value={filters.termo}
                                  onChange={e => setFilters({ ...filters, termo: e.target.value })}
                                  className="h-10 bg-[#222222] border-white/10"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Tipo de Busca</Label>
                                  <Select value={filters.tipo_busca} onValueChange={(v: any) => setFilters({ ...filters, tipo_busca: v })}>
                                    <SelectTrigger className="h-10 bg-[#222222] border-white/10 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="radical">Radical (parcial)</SelectItem>
                                      <SelectItem value="exata">Exata</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-3 pt-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block">Buscar em:</Label>
                                <div className="flex gap-6">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="razao" checked={filters.buscar_razao_social} onCheckedChange={(c) => setFilters({ ...filters, buscar_razao_social: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="razao" className="text-sm text-muted-foreground">Razão Social</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="fantasia" checked={filters.buscar_nome_fantasia} onCheckedChange={(c) => setFilters({ ...filters, buscar_nome_fantasia: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="fantasia" className="text-sm text-muted-foreground">Nome Fantasia</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="socio" checked={filters.buscar_nome_socio} onCheckedChange={(c) => setFilters({ ...filters, buscar_nome_socio: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="socio" className="text-sm text-muted-foreground">Sócios</label>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Datas e Capital */}
                          <AccordionItem value="datas" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              📅 Datas e Capital Social
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Data Abertura (De)</Label>
                                  <Input
                                    type="date"
                                    value={filters.data_abertura_inicio}
                                    onChange={e => setFilters({ ...filters, data_abertura_inicio: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10 text-white block w-full"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Data Abertura (Até)</Label>
                                  <Input
                                    type="date"
                                    value={filters.data_abertura_fim}
                                    onChange={e => setFilters({ ...filters, data_abertura_fim: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10 text-white block w-full"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Últimos X dias</Label>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 30"
                                    value={filters.ultimos_dias}
                                    onChange={e => setFilters({ ...filters, ultimos_dias: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Capital Social Mínimo (R$)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 10000"
                                    value={filters.capital_minimo}
                                    onChange={e => setFilters({ ...filters, capital_minimo: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Capital Social Máximo (R$)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 1000000"
                                    value={filters.capital_maximo}
                                    onChange={e => setFilters({ ...filters, capital_maximo: e.target.value })}
                                    className="h-10 bg-[#222222] border-white/10 text-white"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Regime Tributário */}
                          <AccordionItem value="regime" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              💰 Regime Tributário
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-5 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block">MEI</Label>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mei_opt" checked={filters.mei_optante} onCheckedChange={(c) => setFilters({ ...filters, mei_optante: !!c, mei_excluir: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="mei_opt" className="text-sm text-muted-foreground">Apenas MEI</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mei_exc" checked={filters.mei_excluir} onCheckedChange={(c) => setFilters({ ...filters, mei_excluir: !!c, mei_optante: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="mei_exc" className="text-sm text-muted-foreground">Excluir MEI</label>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block">Simples Nacional</Label>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="simples_opt" checked={filters.simples_optante} onCheckedChange={(c) => setFilters({ ...filters, simples_optante: !!c, simples_excluir: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="simples_opt" className="text-sm text-muted-foreground">Apenas Simples</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="simples_exc" checked={filters.simples_excluir} onCheckedChange={(c) => setFilters({ ...filters, simples_excluir: !!c, simples_optante: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="simples_exc" className="text-sm text-muted-foreground">Excluir Simples</label>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Filtros Extras */}
                          <AccordionItem value="extras" className="border-b-0">
                            <AccordionTrigger className="text-[15px] font-semibold hover:no-underline hover:bg-white/5 px-4 rounded-lg transition-all data-[state=open]:bg-white/5">
                              ⚙️ Filtros Extras
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2 space-y-5 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="com_email" checked={filters.com_email} onCheckedChange={(c) => setFilters({ ...filters, com_email: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="com_email" className="text-sm text-muted-foreground">Apenas com Email</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="com_telefone" checked={filters.com_telefone} onCheckedChange={(c) => setFilters({ ...filters, com_telefone: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="com_telefone" className="text-sm text-muted-foreground">Apenas com Telefone</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="excluir_contab" checked={filters.excluir_email_contab} onCheckedChange={(c) => setFilters({ ...filters, excluir_email_contab: !!c })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="excluir_contab" className="text-sm text-muted-foreground">Excluir emails de contabilidade</label>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="somente_fixo" checked={filters.somente_fixo} onCheckedChange={(c) => setFilters({ ...filters, somente_fixo: !!c, somente_celular: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="somente_fixo" className="text-sm text-muted-foreground">Somente Telefone Fixo</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="somente_celular" checked={filters.somente_celular} onCheckedChange={(c) => setFilters({ ...filters, somente_celular: !!c, somente_fixo: false })} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <label htmlFor="somente_celular" className="text-sm text-muted-foreground">Somente Celular</label>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {/* Right Column: Pre-Visualization & Results */}
                      <div className="flex-1 flex flex-col h-full bg-[#121212]/30 relative overflow-hidden">
                        {importProgress && (
                          <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 flex flex-col items-center justify-start pt-[15vh] p-8 backdrop-blur-md animate-in fade-in duration-500">
                            <div className="w-full max-w-lg space-y-10">
                              {/* Header Section */}
                              <div className="text-center space-y-3">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400 relative z-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Importação em Curso</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">Estamos processando seus leads com inteligência e precisão.</p>
                              </div>

                              {/* Stages Section */}
                              <div className="space-y-4 px-6">
                                <div className="flex items-center gap-4 transition-all duration-500 opacity-100">
                                  <div className={`w-2 h-2 rounded-full ${importProgress.stage >= 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                  <span className={`text-[13px] font-medium transition-colors ${importProgress.stage === 1 ? 'text-white' : 'text-muted-foreground'}`}>Conexão com Provedor de Dados</span>
                                  {importProgress.stage > 1 && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                </div>
                                <div className="flex items-center gap-4 transition-all duration-500">
                                  <div className={`w-2 h-2 rounded-full ${importProgress.stage >= 2 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                  <span className={`text-[13px] font-medium transition-colors ${importProgress.stage === 2 ? 'text-white' : 'text-muted-foreground'}`}>Varredura e Extração de CNPJs</span>
                                  {importProgress.stage > 2 && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                </div>
                                <div className="flex items-center gap-4 transition-all duration-500">
                                  <div className={`w-2 h-2 rounded-full ${importProgress.stage >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                  <span className={`text-[13px] font-medium transition-colors ${importProgress.stage === 3 ? 'text-white' : 'text-muted-foreground'}`}>Enriquecemento de Leads (E-mail/Tel)</span>
                                  {importProgress.stage > 3 && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                </div>
                                <div className="flex items-center gap-4 transition-all duration-500">
                                  <div className={`w-2 h-2 rounded-full ${importProgress.stage >= 4 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                  <span className={`text-[13px] font-medium transition-colors ${importProgress.stage === 4 ? 'text-white' : 'text-muted-foreground'}`}>Persistência no Banco de Dados</span>
                                  {importProgress.stage > 4 && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                </div>
                              </div>

                              {/* Progress Animation */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2 px-1">
                                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">{importProgress.status}</span>
                                  <span className="text-sm font-mono text-white/50">{Math.round((importProgress.stage / 5) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                  <div
                                    className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                    style={{ width: `${(importProgress.stage / 5) * 100}%` }}
                                  />
                                </div>
                              </div>

                              <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.4em] font-medium opacity-30">
                                  Dashformance Lead Extraction Engine
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {searchResults ? (
                          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Stats & Import Header */}
                            <div className="p-6 border-b border-white/5 bg-[#1c1c1c]/40">
                              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                <div className="space-y-1">
                                  <p className="flex items-center gap-2 text-emerald-400 font-semibold text-xl tracking-tight">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {searchResults.total.toLocaleString()} leads encontrados
                                  </p>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide opacity-70">
                                    Preview das 20 empresas mais recentes
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 bg-[#181818] p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="flex flex-col px-3">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5 opacity-60">Qtde Importar</Label>
                                    <Input
                                      className="w-20 h-7 p-0 bg-transparent border-0 focus-visible:ring-0 text-white font-mono text-sm inline-block"
                                      type="number"
                                      value={importQuantity}
                                      onChange={e => setImportQuantity(e.target.value)}
                                    />
                                  </div>
                                  <div className="h-8 w-px bg-white/5" />
                                  <Button
                                    onClick={handleImport}
                                    disabled={extracting}
                                    size="sm"
                                    className="bg-white text-black hover:bg-gray-200 h-9 px-6 rounded-lg font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                  >
                                    {extracting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Importando...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Importar Leads
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Interactive Preview Table */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 scroller custom-scrollbar relative">
                              <div className="rounded-xl border border-white/5 overflow-hidden bg-[#181818]/50 shadow-2xl">
                                <Table>
                                  <TableHeader className="bg-[#1c1c1c] sticky top-0 z-20">
                                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                                      <TableHead className="text-[11px] uppercase font-bold text-white/70 py-4 px-4 w-[160px]">CNPJ</TableHead>
                                      <TableHead className="text-[11px] uppercase font-bold text-white/70 py-4 px-4">Razão Social</TableHead>
                                      <TableHead className="text-[11px] uppercase font-bold text-white/70 py-4 px-4">Nome Fantasia</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {searchResults.leads.slice(0, 50).map((l: any, idx: number) => {
                                      const isAlreadyInCRM = leads.some(existing => existing.cnpj === l.cnpj);
                                      return (
                                        <TableRow
                                          key={l.cnpj}
                                          className={`border-b border-white/5 group transition-all duration-200 ${isAlreadyInCRM ? 'bg-emerald-500/3 opacity-60' : 'hover:bg-white/[0.02]'}`}
                                          style={{ animationDelay: `${idx * 40}ms`, animation: 'fade-in 0.4s ease-out forwards' }}
                                        >
                                          <TableCell className="font-mono text-[11px] text-muted-foreground/70 py-4 px-4 group-hover:text-white transition-colors">
                                            <div className="flex items-center gap-2">
                                              {l.cnpj}
                                              {isAlreadyInCRM && <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] hover:bg-emerald-500/20 border-0 h-4 px-1">No CRM</Badge>}
                                            </div>
                                          </TableCell>
                                          <TableCell className={`text-sm font-medium py-4 px-4 ${isAlreadyInCRM ? 'text-white/40' : 'text-white/90'}`}>{l.razao_social}</TableCell>
                                          <TableCell className="text-sm text-muted-foreground/80 py-4 px-4 italic group-hover:text-muted-foreground transition-colors">{l.nome_fantasia || '-'}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Floating indicator */}
                              <div className="mt-4 flex justify-center">
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                                  Dados fornecidos pela Casa dos Dados
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground animate-in fade-in duration-700">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                              <Search className="w-10 h-10 opacity-10" />
                            </div>
                            <h4 className="text-lg font-medium text-white/50 mb-2">Visão Geral dos Resultados</h4>
                            <p className="text-sm max-w-sm mx-auto leading-relaxed">
                              Configure os parâmetros ao lado para prospectar novos leads. Os resultados e a importação aparecerão aqui.
                            </p>

                            <div className="mt-12 grid grid-cols-2 gap-4 max-w-lg w-full">
                              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left">
                                <div className="text-white/40 mb-1"><Globe className="w-5 h-5" /></div>
                                <div className="text-xs font-bold text-white/60 mb-1 uppercase tracking-tighter">Alcance Nacional</div>
                                <div className="text-[11px] leading-snug">Acesso direto a mais de 50 milhões de CNPJs ativos e inativos em todo o Brasil.</div>
                              </div>
                              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left">
                                <div className="text-white/40 mb-1"><Target className="w-5 h-5" /></div>
                                <div className="text-xs font-bold text-white/60 mb-1 uppercase tracking-tighter">Segmentação Ilimitada</div>
                                <div className="text-[11px] leading-snug">Filtre por CNAE, Localização, Capital Social, Sócios e Regime Tributário.</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex justify-between sm:justify-between p-6 pt-4 border-t border-white/10 bg-muted shrink-0">
                    <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-white hover:bg-white/5">
                      <X className="w-4 h-4 mr-2" /> Limpar Filtros
                    </Button>
                    <Button onClick={handleSearch} disabled={extracting} className="bg-white text-black hover:bg-gray-200">
                      {extracting ? "Buscando..." : "🔍 Buscar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-[#1C1C1C] border border-white/5 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <CardTitle>
                {filterMyLeads ? 'Meus Leads' : (filterOwner === 'all' ? 'Todos os Leads' : `Leads de ${filterOwner === 'joao' ? 'João' : 'Vitor'}`)}
                ({filterOwner === 'all' ? ownerCounts.all : (filterOwner === 'joao' ? ownerCounts.joao : ownerCounts.vitor)})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-[280px] bg-muted border-white/10 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex bg-muted p-1 rounded-full border border-white/5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#222222] shadow-sm text-white' : 'text-muted-foreground hover:text-white'}`}
                  title="Visualização em Lista"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'kanban' ? 'bg-[#222222] shadow-sm text-white' : 'text-[#8A8A8A] hover:text-white'}`}
                  title="Visualização Kanban"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Smart Responsible Filter with Counts */}
                <div className="flex bg-muted p-1 rounded-full border border-white/5 gap-1">
                  <button
                    onClick={() => { setFilterMyLeads(false); setFilterOwner('all'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filterMyLeads && filterOwner === 'all' ? 'bg-[#222222] text-white' : 'text-muted-foreground hover:text-white'}`}
                  >
                    Todos ({ownerCounts.all})
                  </button>
                  <button
                    onClick={() => { setFilterMyLeads(false); setFilterOwner('joao'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filterMyLeads && filterOwner === 'joao' ? 'bg-[#222222] text-white' : 'text-muted-foreground hover:text-white'}`}
                  >
                    João ({ownerCounts.joao})
                  </button>
                  <button
                    onClick={() => { setFilterMyLeads(false); setFilterOwner('vitor'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filterMyLeads && filterOwner === 'vitor' ? 'bg-[#222222] text-white' : 'text-muted-foreground hover:text-white'}`}
                  >
                    Vitor ({ownerCounts.vitor})
                  </button>
                </div>

                {/* Sorting Control */}
                <Select value={sortBy} onValueChange={(v: 'status' | 'alpha' | 'date_asc' | 'date_desc') => setSortBy(v)}>
                  <SelectTrigger className="h-8 w-auto border-0 bg-transparent shadow-none px-2 gap-1.5 focus:ring-0 text-white font-medium hover:text-white text-xs">
                    <span className="text-muted-foreground">Ordenar:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="date_desc">Mais Recentes</SelectItem>
                    <SelectItem value="date_asc">Mais Antigos</SelectItem>
                    <SelectItem value="alpha">A-Z</SelectItem>
                    <SelectItem value="status">Por Status</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="bg-white text-black hover:bg-white/90 h-8 text-xs font-bold"
                  onClick={handleAddNewLead}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Novo Lead
                </Button>
              </div>
            </div>

            {selectedLeads.size > 0 && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-5">
                <span className="text-sm text-[#DECCA8] font-medium">{selectedLeads.size} selecionados</span>
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-[150px] h-9 bg-transparent border-[rgba(255,255,255,0.10)] text-white focus:ring-0 hover:bg-white/5 data-[placeholder]:text-white">
                    <SelectValue placeholder="Alterar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_MAP).map(key => (
                      <SelectItem key={key} value={key}>{STATUS_MAP[key].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {viewMode === 'kanban' ? (
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818]/50 p-6 overflow-hidden">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setPipelineTab('triagem')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pipelineTab === 'triagem'
                      ? 'bg-slate-500/20 text-white border border-slate-500/30'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                  >
                    📥 Triagem
                    <span className="ml-2 text-xs opacity-70">
                      ({leads.filter(l => l.status === 'INBOX' || l.status === 'SCREENING').length})
                    </span>
                  </button>
                  <button
                    onClick={() => setPipelineTab('pipeline')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pipelineTab === 'pipeline'
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                  >
                    💰 Pipeline
                    <span className="ml-2 text-xs opacity-70">
                      ({leads.filter(l => !['INBOX', 'SCREENING'].includes(l.status)).length})
                    </span>
                  </button>
                </div>
                <KanbanBoard
                  leads={pipelineTab === 'triagem'
                    ? displayedLeads.filter(l => l.status === 'INBOX' || l.status === 'SCREENING')
                    : displayedLeads.filter(l => !['INBOX', 'SCREENING'].includes(l.status))
                  }
                  columns={pipelineTab === 'triagem' ? TRIAGEM_COLUMNS : PIPELINE_COLUMNS}
                  onLeadUpdate={handleKanbanUpdate}
                  onEditLead={openLeadSheet}
                  onUpdateTitle={(id, title) => handleSaveLead({ id, trade_name: title })}
                  onDisqualify={(id) => handleKanbanUpdate(id, 'DISQUALIFIED')}
                  onApprove={(id) => handleKanbanUpdate(id, 'NEW')}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted/80 border-b-0">
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={displayedLeads.length > 0 && selectedLeads.size === displayedLeads.length}
                        onCheckedChange={selectAllLeads}
                        className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                    </TableHead>
                    <TableHead className="w-[200px] text-white font-semibold">Empresa</TableHead>
                    <TableHead className="w-[300px] text-white font-semibold">Contatos</TableHead>
                    <TableHead className="w-[160px] text-white font-semibold">Status</TableHead>
                    <TableHead className="w-[80px] text-white font-semibold">Resp.</TableHead>
                    <TableHead className="w-[120px] text-white font-semibold">Data Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">Carregando leads...</TableCell>
                    </TableRow>
                  ) : (displayedLeads || []).map((lead: any) => (
                    <TableRow key={lead.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedLeads.has(lead.id) ? 'bg-muted/50' : ''}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                          className="border-ring data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white text-base">{lead.trade_name || lead.company_name}</div>
                        <div className="text-xs text-muted-foreground">{lead.company_name}</div>
                        <div className="text-xs font-mono text-muted-foreground/80 mt-1">{lead.cnpj}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {lead.email ? (
                            <div className="flex items-center gap-2" title={lead.email}>
                              <span className="text-[#6B6B6B]">✉️</span> <span className="text-[#D4D4D4] break-all">{lead.email}</span>
                            </div>
                          ) : <span className="text-xs text-[#6B6B6B] italic">Sem email</span>}
                          {lead.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#6B6B6B]">📞</span> <span className="text-[#D4D4D4]">{lead.phone}</span>
                            </div>
                          ) : <span className="text-xs text-[#6B6B6B] italic">Sem telefone</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Inline Status Select */}
                        <Select
                          value={lead.status}
                          onValueChange={(newStatus) => handleStatusChange(lead.id, newStatus)}
                        >
                          <SelectTrigger className={`h-8 w-auto border-0 ${STATUS_MAP[lead.status]?.color || 'bg-muted text-white'} rounded-full px-3 text-xs font-medium shadow-none focus:ring-0`}>
                            <SelectValue>{STATUS_MAP[lead.status]?.label || lead.status}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_MAP).map(([key, val]) => (
                              <SelectItem key={key} value={key}>{val.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-transparent border border-white/20 text-white">
                          <span className="text-[10px] font-medium">
                            {lead.owner === 'vitor' ? 'VN' : 'J'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(lead.date_added).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card >

        {/* Pagination Controls */}
        < div className="flex justify-between items-center text-sm text-slate-500" >
          <div>
            Página {meta?.page || 1} de {meta?.last_page || 1} (Total: {meta?.total || 0})
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Anterior
            </Button>
            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= (meta?.last_page || 1) || loading}>
              Próxima
            </Button>
          </div>
        </div >

        {/* Edit Dialog */}
        <LeadSheet
          lead={selectedLeadForSheet}
          isOpen={isSheetOpen}
          onClose={() => {
            setIsSheetOpen(false);
            setSelectedLeadForSheet(null);
          }}
          onSave={handleSaveLead}
        />

        <ImportReviewDialog
          isOpen={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          candidates={candidates}
          onCandidatesChange={setCandidates}
          isSaving={isConfirmingSave}
          onCancel={handleCancelImport}
          onConfirm={handleConfirmImport}
        />

      </div>

      {/* Version Monitoring Tag */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <span className="text-[10px] font-mono text-white/20 bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
          v3.2.5-stable
        </span>
      </div>
    </div>
  );
}
