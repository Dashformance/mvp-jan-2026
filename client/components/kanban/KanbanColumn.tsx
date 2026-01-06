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
}

export function KanbanColumn({ id, title, color, leads, onEdit, onUpdateTitle, onDisqualify, onApprove }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    // Determine if this is a triagem column (show approve button)
    const isTriagemColumn = id === 'INBOX' || id === 'SCREENING';

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] bg-muted rounded-xl border border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${color.includes('bg-') ? color.split(' ')[0] : 'bg-white/20'}`} />
                    <h3 className="font-medium text-sm text-white">
                        {title}
                    </h3>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full">
                    {leads.length}
                </span>
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
