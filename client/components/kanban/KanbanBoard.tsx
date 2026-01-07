"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";

// Column definitions for different views
export const TRIAGEM_COLUMNS = [
    { id: "INBOX", title: "Lista fria", color: "bg-slate-500/20 text-slate-400" },
    { id: "DISQUALIFIED", title: "Desqualificados", color: "bg-red-500/20 text-red-400" },
];

export const PIPELINE_COLUMNS = [
    { id: "INBOX", title: "❄️ Lista Fria", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    { id: "NEW", title: "✅ Qualificado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "ATTEMPTED", title: "📞 Tentativa", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { id: "CONTACTED", title: "💬 Contatado", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { id: "MEETING", title: "📅 Reunião", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { id: "WON", title: "💰 Fechamento", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { id: "LOST", title: "🔻 Perdido", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    { id: "DISQUALIFIED", title: "🚫 Desqualificado", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
];

interface ColumnDefinition {
    id: string;
    title: string;
    color: string;
}

interface KanbanBoardProps {
    leads: any[];
    columns?: ColumnDefinition[];  // NEW: Accept columns as prop
    onLeadUpdate: (id: string, newStatus: string) => void;
    onEditLead: (lead: any) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;  // NEW: For triagem approval
}

export function KanbanBoard({
    leads,
    columns: columnDefs = PIPELINE_COLUMNS,
    onLeadUpdate,
    onEditLead,
    onUpdateTitle,
    onDisqualify,
    onApprove
}: KanbanBoardProps) {
    const [activeLead, setActiveLead] = useState<any | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Group leads by status using provided column definitions
    const columns = useMemo(() => {
        const grouped = columnDefs.map(col => ({
            ...col,
            leads: leads.filter(l => (l.status || "INBOX") === col.id)
        }));
        return grouped;
    }, [leads, columnDefs]);

    const handleDragStart = (event: DragStartEvent) => {
        const lead = leads.find(l => l.id === event.active.id);
        if (lead) setActiveLead(lead);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveLead(null);

        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as string;

        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== newStatus) {
            onLeadUpdate(leadId, newStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        leads={col.leads}
                        onEdit={onEditLead}
                        onUpdateTitle={onUpdateTitle}
                        onDisqualify={onDisqualify}
                        onApprove={onApprove}
                    />
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeLead ? (
                        <div className="w-[260px] opacity-80 rotate-2">
                            <KanbanCard
                                lead={activeLead}
                                onEdit={() => { }}
                                onUpdateTitle={onUpdateTitle}
                            />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
