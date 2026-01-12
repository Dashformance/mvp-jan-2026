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
    // Deprecated fields kept for types but UI should prefer contacts
    phone?: string;
    email?: string;
    decision_maker?: string;

    status: string;
    uf?: string;
    score?: number;
    checklist?: any;
    contacts?: any[]; // Prism Relation
    last_contact_date?: string | Date; // NEW: Interaction tracking
    owner?: string;
}

interface KanbanCardProps {
    lead: Lead;
    onEdit: (lead: Lead) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;
    onQuickContact?: (id: string) => void; // NEW
}

export function KanbanCard({ lead, onEdit, onUpdateTitle, onDisqualify, onApprove, onQuickContact }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id,
    });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(lead.trade_name || lead.company_name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Resolve Primary Contact Info
    const primaryContact = lead.contacts?.[0];
    const displayName = primaryContact?.name || lead.decision_maker;
    const displayPhone = primaryContact?.phone || primaryContact?.whatsapp || lead.phone;
    const displayEmail = primaryContact?.email || lead.email;

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
        const phone = primaryContact?.whatsapp || primaryContact?.phone || lead.phone;
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}`, "_blank");
    };

    const handleEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        const email = primaryContact?.email || lead.email;
        if (!email) return;
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

    const hoverStyle = "hover:border-accent/50 hover:shadow-[0_0_15px_-3px_rgba(222,204,168,0.1)]";

    // Date formatting logic
    const getLastContactLabel = () => {
        if (!lead.last_contact_date) return null;
        const date = new Date(lead.last_contact_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { text: "Hoje", color: "text-emerald-400" };
        if (diffDays === 1) return { text: "Ontem", color: "text-muted-foreground" };
        if (diffDays < 7) return { text: `${diffDays}d atrás`, color: "text-muted-foreground" };
        return { text: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), color: "text-muted-foreground" };
    };

    const lastContact = getLastContactLabel();

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-3 touch-none">
            <Card
                className={`cursor-grab active:cursor-grabbing transition-all border-l-4 border-l-accent group relative overflow-hidden ${hoverStyle}`}
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
                        {displayName ? (
                            <span className="flex items-center gap-1 text-accent font-medium">
                                <User className="w-3 h-3" /> {displayName}
                            </span>
                        ) : (
                            <span className="text-[#6B6B6B] italic">Sem contato</span>
                        )}
                    </CardDescription>

                </CardHeader>
                <CardContent className="p-4 pt-0 pb-4">
                    {/* Last Contact Indicator Row */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2 text-xs text-muted-foreground items-center">
                            {lead.score !== undefined && lead.score > 0 && (
                                <Badge variant="outline" className={`text-[10px] h-5 px-2 border-white/10 ${lead.score >= 85 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' :
                                    lead.score >= 70 ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' :
                                        lead.score >= 55 ? 'text-amber-400 border-amber-500/30 bg-amber-500/5' :
                                            'text-gray-400 border-gray-500/30 bg-gray-500/5'
                                    }`}>
                                    {lead.score} pts
                                </Badge>
                            )}

                        </div>

                        {/* Quick Contact Checkbox */}
                        {onQuickContact && (
                            <div
                                className="flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickContact(lead.id);
                                }}
                                title="Marcar contato feito hoje"
                            >
                                <div className={`w-3 h-3 rounded-full border ${lastContact?.text === 'Hoje' ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/50'}`}>
                                    {lastContact?.text === 'Hoje' && <Check className="w-2 h-2 text-black" />}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{lastContact?.text === 'Hoje' ? 'Feito' : 'Hoje?'}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-2 items-center justify-between" onPointerDown={e => e.stopPropagation()}>

                        {/* Owner Badge */}
                        <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.owner === 'joao' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                lead.owner === 'vitor' ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30' :
                                    'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                                }`} title={lead.owner === 'joao' ? 'João' : lead.owner === 'vitor' ? 'Vitor' : 'Sem dono'}>
                                {lead.owner ? lead.owner.charAt(0).toUpperCase() : '?'}
                            </div>

                            {/* Last Action Text */}
                            {lastContact ? (
                                <span className={`text-[10px] ${lastContact.color}`}>
                                    {lastContact.text}
                                </span>
                            ) : (
                                <span className="text-[10px] text-zinc-600">Sem atividade</span>
                            )}
                        </div>

                        {/* Quick Actions (Compact) */}
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={`h-6 w-6 rounded-full hover:bg-emerald-500/20 hover:text-emerald-400 ${!displayPhone ? 'opacity-30 pointer-events-none' : 'text-zinc-500'}`}
                                onClick={handleWhatsApp}
                                title="Abrir WhatsApp"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={`h-6 w-6 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 ${!displayEmail ? 'opacity-30 pointer-events-none' : 'text-zinc-500'}`}
                                onClick={handleEmail}
                                title="Enviar Email"
                            >
                                <Mail className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
