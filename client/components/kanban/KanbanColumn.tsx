"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import { useState, useRef, useEffect } from "react";
import { Plus, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * DS v2.0 Kanban Column
 * - Width: 320px (--kanban-column-width)
 * - Background: bg-bg-primary (#181818)
 * - Border: border-border-subtle (rgba 5%)
 * - Radius: 12px (rounded-lg)
 */

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    leads: any[];
    onEdit: (lead: any) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;
    onQuickContact?: (id: string) => void;
    onAddLead?: (status: string) => void;
    onRenameColumn?: (id: string, newTitle: string) => void;
    onToggleFavorite?: (id: string, isStarred: boolean) => void;
    onDelete?: (id: string) => void;
    onDeleteColumn?: (id: string) => void;
    onUpdateMeetingType?: (id: string, currentType: string) => void;
    is_win_stage?: boolean;
    is_lost_stage?: boolean;
}

export function KanbanColumn({
    id,
    title,
    color,
    leads,
    onEdit,
    onUpdateTitle,
    onDisqualify,
    onApprove,
    onQuickContact,
    onAddLead,
    onRenameColumn,
    onToggleFavorite,
    onDelete,
    onDeleteColumn,
    onUpdateMeetingType,
    is_win_stage,
    is_lost_stage
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [titleValue, setTitleValue] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitleValue(title);
    }, [title]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleTitleSubmit = () => {
        setIsEditing(false);
        if (titleValue !== title && onRenameColumn) {
            onRenameColumn(id, titleValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSubmit();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setTitleValue(title);
        }
    };

    // Determine if this is a triagem column (show approve button)
    const isTriagemColumn = id === 'INBOX' || id === 'SCREENING';

    // Extract status color dot from the color string
    const getStatusDotColor = () => {
        if (color.includes('slate')) return 'bg-slate-500';
        if (color.includes('blue')) return 'bg-blue-500';
        if (color.includes('amber')) return 'bg-amber-500';
        if (color.includes('indigo')) return 'bg-indigo-500';
        if (color.includes('cyan')) return 'bg-cyan-500';
        if (color.includes('emerald')) return 'bg-emerald-500';
        if (color.includes('rose') || color.includes('red')) return 'bg-rose-500';
        if (color.includes('gray')) return 'bg-gray-500';
        return 'bg-white/20';
    };

    return (
        <div className="flex flex-col h-full min-h-0 min-w-[320px] w-[320px] bg-bg-deep rounded-md">
            {/* Header - DS v2.0 */}
            <div className="sticky top-0 z-10 bg-bg-primary px-4 py-3 border-b border-border-subtle flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor()}`} />

                    {isEditing ? (
                        <Input
                            ref={inputRef}
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm font-medium bg-bg-elevated border-border-default text-white px-2 py-0 w-full"
                        />
                    ) : (
                        <h3
                            className="font-medium text-sm text-white cursor-pointer hover:text-accent transition-colors truncate"
                            onDoubleClick={() => setIsEditing(true)}
                            title="Duplo clique para renomear"
                        >
                            {title}
                        </h3>
                    )}
                </div>

                <div className="flex items-center gap-2 pl-2 shrink-0">
                    {/* Metrics Badge Group */}
                    <div className="flex items-center gap-1.5 bg-bg-elevated/50 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/5 shadow-inner">
                        {/* Avg Score */}
                        {leads.length > 0 && (
                            <span className="font-display text-[10px] font-bold text-accent/70 border-r border-white/10 pr-1.5" title="Média de Score">
                                {Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)} XP
                            </span>
                        )}
                        {/* Total Value */}
                        {(() => {
                            const totalValue = leads.reduce((sum, lead) => sum + (Number(lead.contract_value) || 0), 0);
                            return totalValue > 0 ? (
                                <span className="font-display text-[10px] font-bold text-neon-green-soft" title="Valor Total">
                                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            ) : (
                                <span className="font-display text-[10px] font-bold text-text-muted">R$ 0</span>
                            );
                        })()}
                    </div>

                    <span className="font-display text-[11px] font-bold text-white bg-accent/20 px-2 py-0.5 rounded-full border border-accent/30 shadow-[0_0_10px_rgba(212,197,165,0.1)]">
                        {leads.length}
                    </span>
                    {onAddLead && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-text-muted hover:text-accent hover:bg-white/5 transition-all"
                            onClick={() => onAddLead(id)}
                            title={`Adicionar lead em ${title}`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {!is_win_stage && !is_lost_stage && onDeleteColumn && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                            onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a coluna "${title}"?`)) {
                                    onDeleteColumn(id);
                                }
                            }}
                            title={`Excluir coluna ${title}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        </Button>
                    )}
                </div>
            </div>

            {/* Droppable Content Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 min-h-0 p-3 overflow-y-auto custom-scrollbar transition-all duration-300 ease-out ${isOver
                    ? 'bg-accent/5 ring-2 ring-accent/30 shadow-[inset_0_0_40px_rgba(212,197,165,0.05)] scale-[1.01]'
                    : ''
                    }`}
            >
                <div className="flex flex-col gap-3">
                    {leads.map((lead) => (
                        <KanbanCard
                            key={lead.id}
                            lead={lead}
                            onEdit={onEdit}
                            onUpdateTitle={onUpdateTitle}
                            onDisqualify={onDisqualify}
                            onApprove={isTriagemColumn ? onApprove : undefined}
                            onQuickContact={onQuickContact}
                            onToggleFavorite={onToggleFavorite}
                            onDelete={onDelete}
                            onUpdateMeetingType={onUpdateMeetingType}
                        />
                    ))}
                </div>

                {leads.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] text-text-muted/40 opacity-50 space-y-3 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
                            <LayoutList className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Sem leads</span>
                    </div>
                )}
            </div>
        </div>
    );
}
