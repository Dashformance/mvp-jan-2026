"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MessageCircle, ExternalLink, User, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;  // NEW: For triagem approval
}

export function KanbanCard({ lead, onEdit, onUpdateTitle, onDisqualify, onApprove }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id,
    });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(lead.trade_name || lead.company_name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitleValue(lead.trade_name || lead.company_name);
    }, [lead.trade_name, lead.company_name]);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingTitle]);

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

    const handleTitleSubmit = (e?: React.FormEvent) => {
        e?.stopPropagation();
        setIsEditingTitle(false);
        if (titleValue !== (lead.trade_name || lead.company_name) && onUpdateTitle) {
            onUpdateTitle(lead.id, titleValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSubmit();
        if (e.key === 'Escape') {
            setIsEditingTitle(false);
            setTitleValue(lead.trade_name || lead.company_name);
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-3 touch-none">
            <Card
                className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all border-l-4 border-l-accent"
                onClick={() => !isEditingTitle && onEdit(lead)}
            >
                <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start h-[24px]">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-1 w-full" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                                <Input
                                    ref={inputRef}
                                    value={titleValue}
                                    onChange={e => setTitleValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => handleTitleSubmit()}
                                    className="h-6 text-xs py-0 px-1 bg-black/50 border-accent/50 text-white w-full"
                                />
                            </div>
                        ) : (
                            <CardTitle
                                className="text-sm font-semibold truncate max-w-[180px] text-white cursor-text hover:text-accent/80 transition-colors"
                                title="Duplo clique para editar"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingTitle(true);
                                }}
                            >
                                {lead.trade_name || lead.company_name}
                            </CardTitle>
                        )}

                        <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                            {onApprove && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-6 w-6 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                                    onClick={(e) => { e.stopPropagation(); onApprove(lead.id); }}
                                    title="Aprovar para Pipeline"
                                >
                                    <Check className="w-3 h-3" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-accent" onClick={handleSearch} title="Pesquisar no Google">
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                            {onDisqualify && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-6 w-6 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                                    onClick={(e) => { e.stopPropagation(); onDisqualify(lead.id); }}
                                    title="Descartar Lead"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
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
