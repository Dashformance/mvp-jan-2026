"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Check, Database } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
    onFilterChange: (filters: {
        search?: string;
        status?: string[];
        owner?: string;
        source?: string[];
        view?: 'mine' | 'all';
    }) => void;
    currentFilters?: {
        search?: string;
        status?: string[];
        owner?: string;
        source?: string[];
        view?: 'mine' | 'all';
    };
}

const SOURCE_OPTIONS = [
    { id: 'DWV', label: 'DWV', color: 'text-neon-cyan-soft' },
    { id: 'Google', label: 'Google', color: 'text-neon-yellow-soft' },
    { id: 'Indicação', label: 'Indicação', color: 'text-neon-green-soft' },
    { id: 'Manual', label: 'Manual', color: 'text-text-muted' },
    { id: 'Outros', label: 'Outros', color: 'text-neon-purple-soft' },
];

const STATUS_OPTIONS = [
    { id: 'NEW', label: 'Novo', color: 'bg-neon-cyan-bg text-neon-cyan' },
    { id: 'ATTEMPTED', label: 'Tentativa', color: 'bg-neon-yellow-bg text-neon-yellow' },
    { id: 'CONTACTED', label: 'Contatado', color: 'bg-neon-purple-bg text-neon-purple' },
    { id: 'MEETING', label: 'Reunião', color: 'bg-neon-cyan-bg text-neon-cyan' },
    { id: 'WON', label: 'Ganho', color: 'bg-neon-green-bg text-neon-green' },
    { id: 'LOST', label: 'Perdido', color: 'bg-neon-red-bg text-neon-red' },
    { id: 'DISQUALIFIED', label: 'Desqualificado', color: 'bg-bg-deep text-text-muted' },
];

export function FilterBar({ onFilterChange, currentFilters }: FilterBarProps) {
    const [search, setSearch] = useState(currentFilters?.search || "");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(currentFilters?.status || []);
    const [selectedSources, setSelectedSources] = useState<string[]>(currentFilters?.source || []);
    const [view, setView] = useState<'mine' | 'all'>(currentFilters?.view || 'mine');

    // Sync with external changes (e.g. from Table Filters)
    useEffect(() => {
        if (currentFilters) {
            if (currentFilters.search !== undefined && currentFilters.search !== search) setSearch(currentFilters.search);
            if (currentFilters.status && JSON.stringify(currentFilters.status) !== JSON.stringify(selectedStatuses)) setSelectedStatuses(currentFilters.status);
            if (currentFilters.source && JSON.stringify(currentFilters.source) !== JSON.stringify(selectedSources)) setSelectedSources(currentFilters.source);
            if (currentFilters.view && currentFilters.view !== view) setView(currentFilters.view);
        }
    }, [currentFilters]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            notifyChange();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, selectedStatuses, selectedSources, view]);

    const notifyChange = () => {
        onFilterChange({
            search: search || undefined,
            status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
            source: selectedSources.length > 0 ? selectedSources : undefined,
            view: view
        });
    };

    const toggleStatus = (id: string) => {
        setSelectedStatuses(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleSource = (id: string) => {
        setSelectedSources(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedStatuses([]);
        setSelectedSources([]);
        setView('mine');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-1">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por empresa, CNPJ ou contato..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-elevated border-subtle h-10 w-full"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-bg-elevated border border-border-subtle p-1 rounded-lg">
                <button
                    onClick={() => setView('mine')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'mine'
                            ? 'bg-accent text-bg-void shadow-[0_0_15px_rgba(222,204,168,0.2)]'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                >
                    Meus Leads
                </button>
                <button
                    onClick={() => setView('all')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'all'
                            ? 'bg-accent text-bg-void shadow-[0_0_15px_rgba(222,204,168,0.2)]'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                >
                    Todos
                </button>
            </div>

            {/* Filters Group */}
            <div className="flex gap-2">
                {/* Status Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={`h-10 border-dashed ${selectedStatuses.length > 0 ? 'border-accent/50 bg-accent-muted text-accent' : 'border-border-subtle bg-bg-elevated'}`}>
                            <Filter className="w-4 h-4 mr-2" />
                            Status
                            {selectedStatuses.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] px-1.5 bg-accent text-bg-void font-bold pointer-events-none">
                                    {selectedStatuses.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-2 bg-bg-surface border-border-default shadow-2xl" align="start">
                        <div className="space-y-1">
                            {STATUS_OPTIONS.map(status => {
                                const isSelected = selectedStatuses.includes(status.id);
                                return (
                                    <div
                                        key={status.id}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-glass-bg' : 'hover:bg-glass-bg/50'}`}
                                        onClick={() => toggleStatus(status.id)}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-accent border-accent' : 'border-border-default bg-transparent'
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3 text-bg-void" />}
                                        </div>

                                        <span className={`text-sm ${status.color.replace('bg-', 'text-').replace('-bg', '-soft')} font-medium`}>
                                            {status.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedStatuses.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-border-subtle/50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-7 text-[10px] items-center text-text-muted hover:text-text-primary uppercase font-bold tracking-widest"
                                    onClick={() => setSelectedStatuses([])}
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Source Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={`h-10 border-dashed ${selectedSources.length > 0 ? 'border-indigo-500/50 bg-indigo-500/5 text-indigo-500' : 'border-subtle bg-elevated'}`}>
                            <Database className="w-4 h-4 mr-2" />
                            Fonte
                            {selectedSources.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] px-1.5 bg-indigo-500/20 text-indigo-300 pointer-events-none">
                                    {selectedSources.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-2 bg-[#1A1A1A] border-[#333] shadow-xl" align="start">
                        <div className="space-y-1">
                            {SOURCE_OPTIONS.map(source => {
                                const isSelected = selectedSources.includes(source.id);
                                return (
                                    <div
                                        key={source.id}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                        onClick={() => toggleSource(source.id)}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-transparent'
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3 text-black" />}
                                        </div>

                                        <span className={`text-sm ${source.color} font-medium`}>
                                            {source.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedSources.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-white/10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-7 text-xs text-muted-foreground hover:text-white"
                                    onClick={() => setSelectedSources([])}
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Clear Button */}
                {(search || selectedStatuses.length > 0 || selectedSources.length > 0) && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 text-muted-foreground hover:text-rose-400">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
