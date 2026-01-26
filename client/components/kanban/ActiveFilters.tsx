"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveFiltersProps {
    filters: {
        search?: string;
        status?: string[];
        owner?: string;
        source?: string[];
        city?: string;
        scoreMin?: number;
        scoreMax?: number;
    };
    onRemove: (key: string, value?: any) => void;
    onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    const hasFilters = Object.values(filters).some(v =>
        (Array.isArray(v) && v.length > 0) ||
        (!Array.isArray(v) && v !== undefined && v !== '')
    );

    if (!hasFilters) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-border-subtle/50 bg-bg-base/30 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mr-2">Filtros ativos:</span>

            {filters.search && (
                <Badge variant="secondary" className="bg-glass-bg text-text-primary hover:neon-glow-accent gap-1.5 py-1 border-border-subtle">
                    Busca: {filters.search}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('search')} />
                </Badge>
            )}

            {filters.city && (
                <Badge variant="secondary" className="bg-glass-bg text-text-primary hover:neon-glow-cyan gap-1.5 py-1 border-border-subtle">
                    Cidade: {filters.city}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('city')} />
                </Badge>
            )}

            {filters.status?.map(status => (
                <Badge key={status} variant="secondary" className="bg-neon-cyan-bg text-neon-cyan border-neon-cyan/20 gap-1.5 py-1">
                    {status}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('status', status)} />
                </Badge>
            ))}

            {filters.source?.map(source => (
                <Badge key={source} variant="secondary" className="bg-neon-purple-bg text-neon-purple border-neon-purple/20 gap-1.5 py-1">
                    Origem: {source}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('source', source)} />
                </Badge>
            ))}

            {(filters.scoreMin !== undefined || filters.scoreMax !== undefined) && (
                <Badge variant="secondary" className="bg-neon-green-bg text-neon-green border-neon-green/20 gap-1.5 py-1">
                    Score: {filters.scoreMin || 0} - {filters.scoreMax || 100}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        onRemove('scoreMin');
                        onRemove('scoreMax');
                    }} />
                </Badge>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-accent ml-auto"
                onClick={onClearAll}
            >
                Limpar todos
            </Button>
        </div>
    );
}
