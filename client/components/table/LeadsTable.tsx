"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, User, MessageCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnFilter } from "./ColumnFilter";
import { useKanban } from "../kanban/kanban-context";
import { MoreHorizontal, UserPlus, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Lead {
    id: string;
    company_name?: string;
    trade_name?: string;
    cnpj?: string;
    decision_maker?: string;
    status: string;
    owner?: string;
    score?: number;
    last_contact_date?: string | Date;
    contacts?: any[];
    city?: string;
    uf?: string;
    is_starred?: boolean;
}

interface LeadsTableProps {
    leads: Lead[];
    selectedLeads?: Set<string>;
    onToggleSelect?: (id: string) => void;
    onSelectAll?: () => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort: (column: string) => void;
    onEdit: (lead: Lead) => void;
    onDelete?: (id: string) => void;
    onStatusChange?: (id: string, newStatus: string) => void;
    onToggleFavorite?: (id: string, isStarred: boolean) => void;
    filters?: any;
    onFilterChange?: (filters: any) => void;
    onBulkUpdate?: (ids: string[], data: any) => Promise<void>;
}

// Fallback fixed options if columns aren't ready
const DEFAULT_STATUS_OPTIONS = [
    { value: 'NEW', label: 'Novo', color: 'text-blue-400' },
    { value: 'ATTEMPTED', label: 'Tentativa', color: 'text-amber-400' },
    { value: 'CONTACTED', label: 'Contatado', color: 'text-indigo-400' },
    { value: 'MEETING', label: 'Reunião', color: 'text-cyan-400' },
    { value: 'WON', label: 'Ganho', color: 'text-emerald-400' },
    { value: 'LOST', label: 'Perdido', color: 'text-rose-400' },
    { value: 'DISQUALIFIED', label: 'Desqualificado', color: 'text-gray-400' },
];

export function LeadsTable({
    leads,
    selectedLeads,
    onToggleSelect,
    onSelectAll,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
    onStatusChange,
    onToggleFavorite,
    filters,
    onFilterChange,
    onBulkUpdate
}: LeadsTableProps) {
    const { columns, bulkUpdateLeads, availableUsers } = useKanban();

    const STATUS_OPTIONS = columns.length > 0
        ? columns.map(c => ({ value: c.id, label: c.title, color: c.color }))
        : DEFAULT_STATUS_OPTIONS;

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        return sortOrder === 'asc'
            ? <ArrowUp className="ml-2 h-4 w-4 text-emerald-400" />
            : <ArrowDown className="ml-2 h-4 w-4 text-emerald-400" />;
    };

    const handleColumnFilter = (key: string, value: any) => {
        onFilterChange?.({ ...filters, [key]: value });
    };

    // ... helper functions ...
    const getLastContactLabel = (dateString?: string | Date) => {
        if (!dateString) return <span className="text-muted-foreground/50">-</span>;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return <span className="text-emerald-400 font-medium">Hoje</span>;
        if (diffDays === 1) return <span className="text-white/80">Ontem</span>;
        return <span className="text-muted-foreground">{diffDays}d atrás</span>;
    };

    const getStatusInfo = (status: string) => {
        const column = columns.find(c => c.id === status);
        if (column) {
            return {
                label: column.title,
                className: `bg-${column.color || 'gray'}-500/10 text-${column.color || 'gray'}-400 border-${column.color || 'gray'}-500/20`
            };
        }

        // Fallback or legacy mapping
        switch (status) {
            case 'NEW': return { label: 'Novo', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
            case 'ATTEMPTED': return { label: 'Tentativa', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
            case 'CONTACTED': return { label: 'Contatado', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
            case 'MEETING': return { label: 'Reunião', className: 'bg-pink-500/10 text-pink-400 border-pink-500/20' };
            case 'WON': return { label: 'Ganho', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
            case 'LOST': return { label: 'Perdido', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
            default: return { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
        }
    };

    const allSelected = leads.length > 0 && selectedLeads?.size === leads.length;

    const handleBulkStatusChange = async (status: string) => {
        if (!selectedLeads || selectedLeads.size === 0) return;
        const ids = Array.from(selectedLeads);
        await (onBulkUpdate || bulkUpdateLeads)(ids, { status });
    };

    const handleBulkOwnerChange = async (ownerId: string, ownerName: string) => {
        if (!selectedLeads || selectedLeads.size === 0) return;
        const ids = Array.from(selectedLeads);
        await (onBulkUpdate || bulkUpdateLeads)(ids, { owner: ownerName, owner_id: ownerId });
    };

    return (
        <div className="relative flex flex-col gap-4 min-h-[1080px]">
            <div className="rounded-md border border-white/5 bg-[#181818]/50 overflow-hidden min-h-[1000px]">
                <Table>
                    <TableHeader className="bg-[#1c1c1c]">
                        <TableRow className="border-b border-white/5 hover:bg-transparent">

                            <TableHead className="w-[40px] px-2 text-center">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={() => onSelectAll?.()}
                                    className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                            </TableHead>

                            <TableHead className="w-[40px] px-2"></TableHead>

                            <TableHead className="w-[300px]">
                                <div className="flex items-center">
                                    <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('alpha')}>
                                        Empresa
                                        {getSortIcon('alpha')}
                                    </Button>
                                    <ColumnFilter
                                        column="Empresa"
                                        type="text"
                                        value={filters?.search}
                                        onChange={(v) => handleColumnFilter('search', v)}
                                    />
                                </div>
                            </TableHead>
                            {/* More headers... keeping standard layout */}
                            <TableHead className="w-[150px]">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Contato</span>
                            </TableHead>

                            <TableHead className="w-[150px]">
                                <div className="flex items-center">
                                    <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('status')}>
                                        Status
                                        {getSortIcon('status')}
                                    </Button>
                                    <ColumnFilter
                                        column="Status"
                                        type="select"
                                        options={STATUS_OPTIONS}
                                        value={filters?.status}
                                        onChange={(v) => handleColumnFilter('status', v)}
                                    />
                                </div>
                            </TableHead>

                            <TableHead className="w-[120px]">
                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('owner')}>
                                    Responsável
                                    {getSortIcon('owner')}
                                </Button>
                            </TableHead>

                            <TableHead className="w-[120px] text-right">
                                <div className="flex items-center justify-end">
                                    <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('score')}>
                                        Score
                                        {getSortIcon('score')}
                                    </Button>
                                </div>
                            </TableHead>

                            <TableHead className="w-[150px] text-right">
                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('last_interaction')}>
                                    Última Interação
                                    {getSortIcon('last_interaction')}
                                </Button>
                            </TableHead>

                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => {
                            const primaryContact = lead.contacts?.find(c => c.is_primary) || lead.contacts?.[0];
                            const isSelected = selectedLeads?.has(lead.id);

                            return (
                                <TableRow
                                    key={lead.id}
                                    className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer group transition-colors ${isSelected ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}
                                    onClick={() => onEdit(lead)}
                                >
                                    <TableCell className="w-[40px] px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleSelect?.(lead.id)}
                                            className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                        />
                                    </TableCell>

                                    <TableCell className="w-[40px] px-2" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={`h-7 w-7 transition-colors ${lead.is_starred ? 'text-accent' : 'text-muted-foreground hover:text-white'}`}
                                            onClick={() => onToggleFavorite?.(lead.id, !lead.is_starred)}
                                        >
                                            <Star className={`w-3.5 h-3.5 ${lead.is_starred ? 'fill-accent' : ''}`} />
                                        </Button>
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white/90 group-hover:text-accent transition-colors">
                                                {lead.trade_name || lead.company_name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{lead.cnpj}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white/80">
                                                {primaryContact?.name || lead.decision_maker || '-'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {primaryContact?.role || 'Decision Maker'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {(() => {
                                            const statusInfo = getStatusInfo(lead.status);
                                            return (
                                                <Badge variant="outline" className={`text-[10px] border px-2 py-0.5 h-6 whitespace-nowrap ${statusInfo.className}`}>
                                                    {statusInfo.label}
                                                </Badge>
                                            );
                                        })()}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {lead.owner ? (
                                                <>
                                                    <div className="h-6 w-6 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-bold">
                                                        {lead.owner.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs capitalize text-muted-foreground">{lead.owner}</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/30 italic">Sem dono</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {lead.score ? (
                                            <span className={`text-xs font-bold ${lead.score >= 80 ? 'text-emerald-400' :
                                                lead.score >= 50 ? 'text-yellow-400' : 'text-muted-foreground'
                                                }`}>{lead.score}</span>
                                        ) : <span className="text-xs text-muted-foreground/30">-</span>}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="text-xs">
                                            {getLastContactLabel(lead.last_contact_date)}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {/* Action Menu could go here */}
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(lead.id); }}
                                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {leads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Nenhum lead encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Bulk Action Bar */}
            {selectedLeads && selectedLeads.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-bg-elevated/95 border border-accent/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl px-8 py-5 flex items-center gap-8 backdrop-blur-xl">
                        <div className="flex flex-col pr-8 border-r border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black text-lg shadow-inner">
                                    {selectedLeads.size}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-tight">Leads Selecionados</span>
                                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-70">Ações em Massa</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Change Status */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Alterar Status
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white w-48">
                                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground px-2 py-1">Selecionar Novo Status</DropdownMenuLabel>
                                    {STATUS_OPTIONS.map(opt => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => handleBulkStatusChange(opt.value)}
                                            className="focus:bg-white/5 cursor-pointer"
                                        >
                                            {opt.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Change Owner */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                                        <UserPlus className="w-4 h-4 text-blue-400" />
                                        Atribuir Responsável
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white w-48">
                                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground px-2 py-1">Consultores Disponíveis</DropdownMenuLabel>
                                    {availableUsers.map((user: any) => (
                                        <DropdownMenuItem
                                            key={user.id}
                                            onClick={() => handleBulkOwnerChange(user.id, user.name || user.email.split('@')[0])}
                                            className="focus:bg-white/5 cursor-pointer"
                                        >
                                            {user.name || user.email}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem onClick={() => handleBulkOwnerChange('', '')} className="focus:bg-white/5 cursor-pointer text-rose-400">Remover Responsável</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="h-6 w-px bg-white/10 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 text-text-muted hover:text-white"
                                onClick={() => onSelectAll?.()}
                            >
                                Limpar Seleção
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
