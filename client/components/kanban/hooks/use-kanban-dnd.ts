"use client";

import { DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";

interface UseKanbanDnDProps {
    leads: any[];
    onLeadUpdate: (id: string, newStatus: string) => void;
}

export function useKanbanDnD({ leads, onLeadUpdate }: UseKanbanDnDProps) {
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

    const handleDragStart = (event: DragStartEvent) => {
        const lead = leads.find(l => l.id === event.active.id);
        if (lead) setActiveLead(lead);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveLead(null);
        if (!over) return;

        const leadId = active.id as string;

        const targetColumnId =
            (over.data.current?.sortable?.containerId as string) || // dropped em card
            (over.id as string);                                    // dropped em coluna vazia

        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === targetColumnId) return;

        onLeadUpdate(leadId, targetColumnId);
    };

    return {
        sensors,
        activeLead,
        handleDragStart,
        handleDragEnd
    };
}
