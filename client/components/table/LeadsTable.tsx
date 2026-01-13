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
import { ArrowUpDown, ArrowUp, ArrowDown, User, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnFilter } from "./ColumnFilter";

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
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort: (column: string) => void;
    onRowClick: (lead: Lead) => void;
    onToggleFavorite?: (id: string, isStarred: boolean) => void;
    filters?: any;
    onFilterChange: (filters: any) => void;
}

const STATUS_OPTIONS = [
    { value: 'NEW', label: 'Novo', color: 'text-blue-400' },
    { value: 'ATTEMPTED', label: 'Tentativa', color: 'text-amber-400' },
    { value: 'CONTACTED', label: 'Contatado', color: 'text-indigo-400' },
    { value: 'MEETING', label: 'Reunião', color: 'text-cyan-400' },
    { value: 'WON', label: 'Ganho', color: 'text-emerald-400' },
    { value: 'LOST', label: 'Perdido', color: 'text-rose-400' },
    { value: 'DISQUALIFIED', label: 'Desqualificado', color: 'text-gray-400' },
];

export function LeadsTable({ leads, sortBy, sortOrder, onSort, onRowClick, onToggleFavorite, filters, onFilterChange }: LeadsTableProps) {

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        return sortOrder === 'asc'
            ? <ArrowUp className="ml-2 h-4 w-4 text-emerald-400" />
            : <ArrowDown className="ml-2 h-4 w-4 text-emerald-400" />;
    };

    const handleColumnFilter = (key: string, value: any) => {
        onFilterChange({ ...filters, [key]: value });
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'ATTEMPTED': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'CONTACTED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'MEETING': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            case 'WON': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'LOST': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="rounded-md border border-white/5 bg-[#181818]/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#1c1c1c]">
                    <TableRow className="border-b border-white/5 hover:bg-transparent">

                        <TableHead className="w-[40px] px-2"></TableHead>
                        <TableHead className="w-[300px]">
                            <div className="flex items-center">
                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('alpha')}>
                                    Empresa
                                    {getSortIcon('alpha')}
                                </Button>
                                {/* We map 'company' filter to the global search to keep it consistent or use a specific field if backend supports */}
                                {/* For Notion Style, let's treat it as generic search */}
                                <ColumnFilter
                                    column="Empresa"
                                    type="text"
                                    value={filters?.search}
                                    onChange={(v) => handleColumnFilter('search', v)}
                                />
                            </div>
                        </TableHead>

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
                            <div className="flex items-center">
                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('owner')}>
                                    Responsável
                                    {getSortIcon('owner')}
                                </Button>
                                {/* Owner filter disabled for now in table to avoid conflict with tabs, or we can enable it if it overrides tabs? */}
                                {/* Let's keep it simple for now and rely on tabs */}
                            </div>
                        </TableHead>

                        <TableHead className="w-[120px] text-right">
                            <div className="flex items-center justify-end">
                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('score')}>
                                    Score
                                    {getSortIcon('score')}
                                </Button>
                                <ColumnFilter
                                    column="Score"
                                    type="range"
                                    value={{ min: filters?.scoreMin, max: filters?.scoreMax }}
                                    onChange={(v) => {
                                        handleColumnFilter('scoreMin', v?.min);
                                        handleColumnFilter('scoreMax', v?.max);
                                    }}
                                />
                            </div>
                        </TableHead>

                        <TableHead className="w-[150px] text-right">
                            <Button variant="ghost" className="h-8 p-0 hover:bg-transparent hover:text-white font-bold text-[11px] uppercase tracking-wider" onClick={() => onSort('date_desc')}>
                                Última Interação
                                {getSortIcon('date_desc')}
                            </Button>
                        </TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => {
                        const primaryContact = lead.contacts?.find(c => c.is_primary) || lead.contacts?.[0];
                        return (
                            <TableRow
                                key={lead.id}
                                className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer group transition-colors"
                                onClick={() => onRowClick(lead)}
                            >
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
                                    <Badge variant="outline" className={`text-[10px] border px-2 py-0.5 h-6 ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {lead.owner ? (
                                            <>
                                                <>
                                                    <div className="h-6 w-6 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-bold">
                                                        {lead.owner.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs capitalize text-muted-foreground">{lead.owner}</span>
                                                </>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/30 italic">Sem dono</span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    {lead.score ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`text-xs font-bold ${lead.score >= 80 ? 'text-emerald-400' :
                                                lead.score >= 50 ? 'text-yellow-400' : 'text-muted-foreground'
                                                }`}>{lead.score}</span>
                                        </div>
                                    ) : <span className="text-xs text-muted-foreground/30">-</span>}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="text-xs">
                                        {getLastContactLabel(lead.last_contact_date)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {leads.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum lead encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
