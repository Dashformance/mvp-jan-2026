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
        <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-white/5 bg-[#1C1C1C]/50">
            <span className="text-xs text-muted-foreground mr-2">Filtros ativos:</span>

            {filters.search && (
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 gap-1.5 py-1">
                    Busca: {filters.search}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('search')} />
                </Badge>
            )}

            {filters.city && (
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 gap-1.5 py-1">
                    Cidade: {filters.city}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('city')} />
                </Badge>
            )}

            {filters.status?.map(status => (
                <Badge key={status} variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1.5 py-1">
                    {status}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('status', status)} />
                </Badge>
            ))}

            {filters.source?.map(source => (
                <Badge key={source} variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1.5 py-1">
                    Origem: {source}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove('source', source)} />
                </Badge>
            ))}

            {(filters.scoreMin !== undefined || filters.scoreMax !== undefined) && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-1">
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
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-white ml-auto"
                onClick={onClearAll}
            >
                Limpar todos
            </Button>
        </div>
    );
}
