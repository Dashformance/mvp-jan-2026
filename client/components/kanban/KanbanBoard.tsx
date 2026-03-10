"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";
import { useKanbanDnD } from "./hooks/use-kanban-dnd";



interface ColumnDefinition {
    id: string;
    title: string;
    color: string;
    is_win_stage?: boolean;
    is_lost_stage?: boolean;
}

import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button"; // Ensure Button is imported

interface KanbanBoardProps {
    leads: any[];
    columns?: ColumnDefinition[];
    onLeadUpdate: (id: string, newStatus: string) => void;
    onEditLead: (lead: any) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;
    onQuickContact?: (id: string) => void;
    onAddLead?: (status: string) => void;
    onRenameColumn?: (id: string, newTitle: string) => void;
    onToggleFavorite?: (id: string, isStarred: boolean) => void;
    onDelete?: (id: string) => void;
    onDeleteColumn?: (id: string) => void;
    onUpdateMeetingType?: (id: string, currentType: string) => void;
}

export function KanbanBoard({
    leads,
    columns: columnDefs = [],
    onLeadUpdate,
    onEditLead,
    onUpdateTitle,
    onDisqualify,
    onApprove,
    onQuickContact,
    onAddLead,
    onRenameColumn,
    onToggleFavorite,
    onDelete,
    onDeleteColumn,
    onUpdateMeetingType
}: KanbanBoardProps) {
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

    const { sensors, activeLead, handleDragStart, handleDragEnd } = useKanbanDnD({
        leads,
        onLeadUpdate
    });

    // Group leads by status using provided column definitions
    const columns = useMemo(() => {
        const grouped = columnDefs.map(col => ({
            ...col,
            leads: leads.filter(l => (l.status || "INBOX") === col.id)
        }));
        return grouped;
    }, [leads, columnDefs]);

    const handleAddColumnSubmit = () => {
        if (newColumnName.trim()) {
            const evt = new CustomEvent('kanban:add-column', { detail: { name: newColumnName } });
            window.dispatchEvent(evt);
            setNewColumnName("");
            setIsAddingColumn(false);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-4 bg-[radial-gradient(circle_at_center,var(--color-bg-elevated)_0%,var(--color-bg-base)_100%)] custom-scrollbar">
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
                        onQuickContact={onQuickContact}
                        onAddLead={onAddLead}
                        onRenameColumn={onRenameColumn}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={onDelete}
                        onDeleteColumn={onDeleteColumn}
                        onUpdateMeetingType={onUpdateMeetingType}
                        is_win_stage={col.is_win_stage}
                        is_lost_stage={col.is_lost_stage}
                    />
                ))}

                {/* Add New Column Button / input */}
                <div className="min-w-[60px] flex items-center justify-center shrink-0">
                    {isAddingColumn ? (
                        <div className="flex flex-col gap-2 w-[320px] bg-bg-primary rounded-lg border border-border-subtle p-4 animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-xs text-text-muted font-medium">Nome da nova coluna</span>
                            <Input
                                autoFocus
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddColumnSubmit();
                                    if (e.key === 'Escape') setIsAddingColumn(false);
                                }}
                                className="h-9 bg-bg-elevated border-border-default"
                                placeholder="Ex: Negociação"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-text-muted hover:text-white" onClick={() => setIsAddingColumn(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="h-7 w-7 p-0 bg-neon-green-bg text-neon-green-soft hover:bg-neon-green-bg/70" onClick={handleAddColumnSubmit}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingColumn(true)}
                            className="h-full max-h-[500px] w-12 rounded-lg border border-dashed border-border-subtle hover:border-accent hover:bg-accent-muted flex items-center justify-center transition-all group"
                            title="Adicionar nova coluna"
                        >
                            <span className="text-2xl text-text-muted group-hover:text-accent">+</span>
                        </button>
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeLead ? (
                        <div className="w-[300px] opacity-90 rotate-2 shadow-2xl">
                            <KanbanCard
                                lead={activeLead}
                                onEdit={() => { }}
                                onUpdateTitle={onUpdateTitle}
                                onQuickContact={onQuickContact}
                                onToggleFavorite={onToggleFavorite}
                                isOverlay={true}
                            />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
