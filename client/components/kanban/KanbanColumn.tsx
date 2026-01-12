"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";

/**
 * Visualizen DS v3.1 Kanban Column
 * - Background: bg-muted (#141414)
 * - Border: border-subtle (rgba 6%)
 * - Radius: 16px
 */

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    leads: any[];
    onEdit: (lead: any) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;  // NEW: For triagem approval
    onQuickContact?: (id: string) => void; // NEW
    onAddLead?: (status: string) => void; // NEW: Add card to column
}

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    onRenameColumn // NEW prop
}: KanbanColumnProps & { onRenameColumn?: (id: string, newTitle: string) => void }) {
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

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] bg-muted rounded-xl border border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center group/header h-[60px]">
                <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.includes('bg-') ? color.split(' ')[0] : 'bg-white/20'}`} />

                    {isEditing ? (
                        <Input
                            ref={inputRef}
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm font-medium bg-black/50 border-white/10 text-white px-2 py-0 w-full focus-visible:ring-1 focus-visible:ring-offset-0"
                        />
                    ) : (
                        <h3
                            className="font-medium text-sm text-white cursor-pointer hover:text-white/80 hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors truncate"
                            onDoubleClick={() => setIsEditing(true)}
                            title="Duplo clique para renomear"
                        >
                            {title}
                        </h3>
                    )}
                </div>
                <div className="flex items-center gap-2 pl-2">
                    <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {leads.length}
                    </span>
                    {onAddLead && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-muted-foreground hover:text-white"
                            onClick={() => onAddLead(id)}
                            title={`Adicionar lead em ${title}`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-150 ${isOver ? 'bg-[rgba(255,255,255,0.03)] ring-2 ring-border ring-inset' : ''}`}
            >
                {leads.map((lead) => (
                    <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onEdit={onEdit}
                        onUpdateTitle={onUpdateTitle}
                        onDisqualify={onDisqualify}

                        onApprove={isTriagemColumn ? onApprove : undefined}
                        onQuickContact={onQuickContact}
                    />
                ))}
                {leads.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-[#6B6B6B] text-xs italic border-2 border-dashed border-[rgba(255,255,255,0.06)] rounded-xl m-2">
                        Arraste leads aqui
                    </div>
                )}
            </div>
        </div>
    );
}
