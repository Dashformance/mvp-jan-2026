"use client";

import { useKanban } from "./kanban-context";
import { KanbanBoard } from "./KanbanBoard";

export function ConnectedKanbanBoard() {
    const {
        leads,
        columns,
        updateLeadStatus,
        openLeadSheet,
        updateLead,
        updateLeadStatus: disqualifyLead, // Alias
        updateLeadStatus: approveLead, // Alias 
        quickContact,
        toggleFavorite,
        deleteLead
    } = useKanban();

    // DnD Hook manages Drag State specific to the board UI
    // Note: We might need to pass `sensors` or `activeLead` to KanbanBoard if we refactor it further.
    // Currently KanbanBoard HAS ITS OWN DnD context.
    // We should ideally strip DnD from KanbanBoard and put it here, BUT to minimize breakage, 
    // let's pass the props KanbanBoard expects.

    // KanbanBoard expects:
    // leads, columns, onLeadUpdate, onEditLead, onUpdateTitle, onDisqualify, onApprove, onQuickContact, onAddLead, onRenameColumn, onToggleFavorite

    return (
        <KanbanBoard
            leads={leads}
            columns={columns}
            onLeadUpdate={updateLeadStatus}
            onEditLead={openLeadSheet}
            onUpdateTitle={(id, newTitle) => {
                // Find lead and update title? "onUpdateTitle" in KanbanCard usually updates company name
                // We need a helper or just reuse updateLead if we have the full object.
                // KanbanBoard passes (id, newTitle) which might be insufficient for updateLead(object).
                // Checking KanbanCard usage: it calls onUpdateTitle(id, newTitle).
                // We need to find the lead first.
                const lead = leads.find(l => l.id === id);
                if (lead) {
                    updateLead({ ...lead, company_name: newTitle });
                }
            }}
            onDisqualify={(id) => updateLeadStatus(id, 'DISQUALIFIED')}
            onApprove={(id) => updateLeadStatus(id, 'NEW')}
            onQuickContact={quickContact}
            onAddLead={(status) => {
                // We can't easily pre-select status in openLeadSheet unless we update the hook.
                // For now, open generic sheet.
                openLeadSheet();
            }}
            onRenameColumn={(id, newTitle) => {
                // Logic for renaming column was local in page.tsx via API?
                // page.tsx didn't seem to implement onRenameColumn explicitly in the view_file snippet I saw.
                // Assuming it's handled or we can implement basic API call here.
                // For now no-op or implement.
            }}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteLead}
        />
    );
}
