"use client";

import { createContext, useContext } from "react";

// Define the shape of the Kanban Context
export interface KanbanContextType {
    leads: any[];
    setLeads: (leads: any[]) => void;
    columns: any[];
    setColumns: (columns: any[]) => void;
    loading: boolean;
    filters: any;
    setFilters: (filters: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: 'list' | 'kanban';
    setViewMode: (mode: 'list' | 'kanban') => void;

    // Actions
    fetchLeads: (page?: number) => Promise<void>;
    updateLeadStatus: (id: string, newStatus: string) => Promise<void>;
    updateLead: (lead: any) => Promise<void>;
    toggleFavorite: (id: string, isStarred: boolean) => Promise<void>;
    quickContact: (id: string) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    cleanupDuplicates: () => Promise<void>;

    // Selection
    selectedLeads: Set<string>;
    toggleSelectLead: (id: string) => void;
    selectAllLeads: () => void;

    // Meta
    meta: any;
    page: number;
    setPage: (page: number) => void;

    // FilterBar
    filterBarState: any;
    setFilterBarState: (state: any) => void;
    sortBy: any;
    setSortBy: (sort: any) => void;

    // UI
    isSheetOpen: boolean;
    openLeadSheet: (lead?: any) => void;
    closeLeadSheet: () => void;
    selectedLeadForSheet: any;
}

export const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export function useKanban() {
    const context = useContext(KanbanContext);
    if (!context) {
        throw new Error("useKanban must be used within a KanbanProvider");
    }
    return context;
}
