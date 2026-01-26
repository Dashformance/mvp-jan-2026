"use client";

import React, { ReactNode } from "react";
import { KanbanContext } from "./kanban-context";
import { useKanbanState } from "./hooks/use-kanban-state";

interface KanbanProviderProps {
    children: ReactNode;
}

export function KanbanProvider({ children }: KanbanProviderProps) {
    const state = useKanbanState();

    return (
        <KanbanContext.Provider value={state as any}>
            {children}
        </KanbanContext.Provider>
    );
}
