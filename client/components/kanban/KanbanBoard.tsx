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
}

export function KanbanBoard({
    leads,
    columns: columnDefs = PIPELINE_COLUMNS,
    onLeadUpdate,
    onEditLead,
    onUpdateTitle,
    onDisqualify,
    onApprove,
    onQuickContact,
    onAddLead,
    onRenameColumn,
    onToggleFavorite
}: KanbanBoardProps) {
    const [activeLead, setActiveLead] = useState<any | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-4 custom-scrollbar">
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
                    />
                ))}

                {/* Add New Column Button / input */}
                <div className="min-w-[50px] flex items-center justify-center">
                    {isAddingColumn ? (
                        <div className="flex flex-col gap-2 w-[280px] bg-muted rounded-xl border border-white/5 p-4 animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-xs text-muted-foreground font-medium">Nome da nova coluna</span>
                            <Input
                                autoFocus
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddColumnSubmit();
                                    if (e.key === 'Escape') setIsAddingColumn(false);
                                }}
                                className="h-9 bg-black/20 border-white/10"
                                placeholder="Ex: Negociação"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsAddingColumn(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="h-7 w-7 p-0 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" onClick={handleAddColumnSubmit}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingColumn(true)}
                            className="h-full max-h-[500px] w-12 rounded-xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center transition-all group"
                            title="Adicionar nova coluna"
                        >
                            <span className="text-2xl text-muted-foreground group-hover:text-white">+</span>
                        </button>
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeLead ? (
                        <div className="w-[260px] opacity-80 rotate-2">
                            <KanbanCard
                                lead={activeLead}
                                onEdit={() => { }}
                                onUpdateTitle={onUpdateTitle}
                                onQuickContact={onQuickContact}
                                onToggleFavorite={onToggleFavorite}
                            />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
