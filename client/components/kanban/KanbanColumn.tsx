"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
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
    onDelete
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
        <div className="flex flex-col h-full min-h-0 min-w-[320px] w-[320px] bg-bg-primary rounded-lg border border-border-subtle">
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
                    {/* Total Value Badge */}
                    {(() => {
                        const totalValue = leads.reduce((sum, lead) => sum + (Number(lead.contract_value) || 0), 0);
                        return totalValue > 0 && (
                            <span className="font-display text-xs font-bold text-neon-green-soft bg-neon-green-bg px-2 py-0.5 rounded-full border border-neon-green/30">
                                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        );
                    })()}
                    <span className="font-display text-xs font-bold text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full border border-border-subtle">
                        {leads.length}
                    </span>
                    {onAddLead && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-text-muted hover:text-white hover:bg-bg-hover"
                            onClick={() => onAddLead(id)}
                            title={`Adicionar lead em ${title}`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Droppable Content Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 min-h-0 p-3 overflow-y-auto custom-scrollbar transition-all duration-150 ${isOver
                    ? 'bg-accent-muted ring-1 ring-accent ring-inset'
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
                        />
                    ))}
                </div>

                {leads.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-text-muted text-xs uppercase tracking-wider border-2 border-dashed border-border-subtle rounded-lg bg-bg-elevated/30">
                        Arraste leads aqui
                    </div>
                )}
            </div>
        </div>
    );
}
