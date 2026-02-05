"use client";

import { useKanban } from "./kanban-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, ChevronDown, UserPlus } from "lucide-react";

export function BulkActionBar() {
    const {
        selectedLeads,
        bulkUpdateLeads,
        availableUsers,
        columns,
        clearSelection
    } = useKanban();

    if (!selectedLeads || selectedLeads.size === 0) return null;

    const DEFAULT_STATUS_OPTIONS = [
        { value: 'NEW', label: 'Novo', color: 'text-blue-400' },
        { value: 'ATTEMPTED', label: 'Tentativa', color: 'text-amber-400' },
        { value: 'CONTACTED', label: 'Contatado', color: 'text-indigo-400' },
        { value: 'MEETING', label: 'Reunião', color: 'text-cyan-400' },
        { value: 'WON', label: 'Ganho', color: 'text-emerald-400' },
        { value: 'LOST', label: 'Perdido', color: 'text-rose-400' },
        { value: 'DISQUALIFIED', label: 'Desqualificado', color: 'text-gray-400' },
    ];

    const STATUS_OPTIONS = columns.length > 0
        ? columns.map(c => ({ value: c.id, label: c.title, color: c.color }))
        : DEFAULT_STATUS_OPTIONS;

    const handleBulkStatusChange = async (status: string) => {
        const ids = Array.from(selectedLeads);
        await bulkUpdateLeads(ids, { status });
    };

    const handleBulkOwnerChange = async (ownerId: string, ownerName: string) => {
        const ids = Array.from(selectedLeads);
        await bulkUpdateLeads(ids, { owner: ownerName, owner_id: ownerId });
    };

    return (
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
                        onClick={() => clearSelection()}
                    >
                        Limpar Seleção
                    </Button>
                </div>
            </div>
        </div>
    );
}
