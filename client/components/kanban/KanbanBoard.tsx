"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";

// Definition of Kanban columns
const COLUMNS = [
    { id: "NEW", title: "Novo", color: "bg-cyan-500/20 text-cyan-400" },
    { id: "ATTEMPTED", title: "Tentando Contato", color: "bg-amber-500/20 text-amber-400" },
    { id: "CONTACTED", title: "Contatado", color: "bg-accent/20 text-accent" },
    { id: "MEETING", title: "Reunião Agendada", color: "bg-cyan-500/20 text-cyan-400" },
    { id: "WON", title: "Ganho / Fechado", color: "bg-emerald-500/20 text-emerald-400" },
    { id: "LOST", title: "Perdido / Descartado", color: "bg-rose-400/15 text-rose-300" },
];

interface KanbanBoardProps {
    leads: any[];
    onLeadUpdate: (id: string, newStatus: string) => void;
    onEditLead: (lead: any) => void;
}

export function KanbanBoard({ leads, onLeadUpdate, onEditLead }: KanbanBoardProps) {
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

    // Group leads by status
    const columns = useMemo(() => {
        const grouped = COLUMNS.map(col => ({
            ...col,
            leads: leads.filter(l => (l.status || "NEW") === col.id)
        }));
        return grouped;
    }, [leads]);

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
            // Optimistic update handled by parent or just call API
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
                    />
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeLead ? (
                        <div className="w-[260px] opacity-80 rotate-2">
                            <KanbanCard lead={activeLead} onEdit={() => { }} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
