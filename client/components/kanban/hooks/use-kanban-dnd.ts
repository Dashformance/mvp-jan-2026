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
        let newStatus = over.id as string;

        // ERROR FIX: If over.id is a lead (dropped on top of another card), 
        // use that lead's status as the target status.
        const overLead = leads.find(l => l.id === over.id);
        if (overLead) {
            newStatus = overLead.status;
        }

        // Verify if status actually changed
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== newStatus) {
            onLeadUpdate(leadId, newStatus);
        }
    };

    return {
        sensors,
        activeLead,
        handleDragStart,
        handleDragEnd
    };
}
