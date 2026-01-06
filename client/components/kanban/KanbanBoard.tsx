"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";

// Column definitions for different views
export const TRIAGEM_COLUMNS = [
    { id: "DISQUALIFIED", title: "❌ Descartado", color: "bg-gray-500/20 text-gray-400" },
    { id: "INBOX", title: "📥 Nova Lista", color: "bg-slate-500/20 text-slate-400" },
    { id: "SCREENING", title: "🔍 Qualificado", color: "bg-amber-500/20 text-amber-400" },
];

export const PIPELINE_COLUMNS = [
    { id: "NEW", title: "✅ Qualificado", color: "bg-cyan-500/20 text-cyan-400" },
    { id: "ATTEMPTED", title: "Tentando Contato", color: "bg-amber-500/20 text-amber-400" },
    { id: "CONTACTED", title: "Contatado", color: "bg-accent/20 text-accent" },
    { id: "MEETING", title: "Reunião Agendada", color: "bg-cyan-500/20 text-cyan-400" },
    { id: "WON", title: "Ganho / Fechado", color: "bg-emerald-500/20 text-emerald-400" },
    { id: "LOST", title: "Perdido", color: "bg-rose-400/15 text-rose-300" },
    { id: "DISQUALIFIED", title: "Descartado", color: "bg-gray-500/20 text-gray-400" },
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
