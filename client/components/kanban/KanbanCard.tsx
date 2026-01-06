"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, ExternalLink, User } from "lucide-react";

/**
 * Visualizen DS v3.1 Kanban Card
 * - Background: bg-elevated (#222222)
 * - Border: border-subtle (rgba 6%)
 * - Accent border-left: Champagne (#DECCA8)
 */

interface Lead {
    id: string;
    company_name: string;
    trade_name: string;
    cnpj: string;
    phone?: string;
    email?: string;
    status: string;
    uf?: string;
    decision_maker?: string;
}

interface KanbanCardProps {
    lead: Lead;
    onEdit: (lead: Lead) => void;
}

export function KanbanCard({ lead, onEdit }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lead.phone) return;
        const cleanPhone = lead.phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}`, "_blank");
    };

    const handleEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lead.email) return;
        let email = lead.email;
        if (typeof email === 'object' && (email as any).email) email = (email as any).email;
        window.location.href = `mailto:${email}`;
    };

    const handleSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        const query = encodeURIComponent(`${lead.trade_name || lead.company_name} ${lead.uf || ''} sócios`);
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-3 touch-none">
            <Card
                className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all border-l-4 border-l-accent"
                onClick={() => onEdit(lead)}
            >
                <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-semibold truncate max-w-[180px] text-white" title={lead.trade_name || lead.company_name}>
                            {lead.trade_name || lead.company_name}
                        </CardTitle>
                        <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-accent" onClick={handleSearch} title="Pesquisar no Google">
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="text-xs truncate">
                        {lead.decision_maker ? (
                            <span className="flex items-center gap-1 text-accent font-medium">
                                <User className="w-3 h-3" /> {lead.decision_maker}
                            </span>
                        ) : (
                            <span className="text-[#6B6B6B] italic">Sem decisor</span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-4">
                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                        {lead.uf && <Badge variant="outline" className="text-[10px] h-5 px-2 border-white/10 text-muted-foreground">{lead.uf}</Badge>}
                        <span className="truncate max-w-[120px]">{lead.phone || "Sem tel"}</span>
                    </div>

                    <div className="flex gap-2 mt-2" onPointerDown={e => e.stopPropagation()}>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 flex-1 gap-1 text-xs ${lead.phone ? 'text-[#4ADE80] border-[rgba(74,222,128,0.3)] hover:bg-[rgba(74,222,128,0.12)]' : 'opacity-30'}`}
                            onClick={handleWhatsApp}
                            disabled={!lead.phone}
                        >
                            <MessageCircle className="w-3 h-3" /> Zap
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 flex-1 gap-1 text-xs ${lead.email ? 'text-[#44CCFF] border-[rgba(68,204,255,0.3)] hover:bg-[rgba(68,204,255,0.12)]' : 'opacity-30'}`}
                            onClick={handleEmail}
                            disabled={!lead.email}
                        >
                            <Mail className="w-3 h-3" /> Email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
