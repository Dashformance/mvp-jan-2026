"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MessageCircle, ExternalLink, User, Check, X, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

/**
 * DS v2.0 Kanban Card
 * - Background: bg-bg-elevated (#222222)
 * - Border: border-border-subtle (rgba 5%)
 * - Border-left: Score indicator (neon colors)
 * - Radius: 8px (rounded-md)
 * - Numbers: font-display (Space Grotesk)
 */

interface Lead {
    id: string;
    company_name: string;
    trade_name: string;
    cnpj: string;
    phone?: string;
    email?: string;
    decision_maker?: string;
    status: string;
    uf?: string;
    score?: number;
    checklist?: any;
    contacts?: any[];
    last_contact_date?: string | Date;
    owner?: string;
    is_starred?: boolean;
    contract_value?: number | string;
    meeting_type?: string;
    meeting_status?: string;
}

interface KanbanCardProps {
    lead: Lead;
    onEdit: (lead: Lead) => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
    onDisqualify?: (id: string) => void;
    onApprove?: (id: string) => void;
    onQuickContact?: (id: string) => void;
    onToggleFavorite?: (id: string, isStarred: boolean) => void;
    onDelete?: (id: string) => void;
    onUpdateMeetingType?: (id: string, currentType: string) => void;
    isOverlay?: boolean;
}

export function KanbanCard({ lead, onEdit, onUpdateTitle, onDisqualify, onApprove, onQuickContact, onToggleFavorite, onDelete, onUpdateMeetingType, isOverlay }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
    });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(lead.trade_name || lead.company_name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Resolve Primary Contact Info
    const primaryContact = lead.contacts?.[0];
    const displayName = primaryContact?.name || lead.decision_maker;
    const displayPhone = primaryContact?.phone || primaryContact?.whatsapp || lead.phone;
    const phoneDigits = displayPhone?.replace(/\D/g, '') || '';
    const maskedPhone = phoneDigits.length >= 4 ? `...${phoneDigits.slice(-4)}` : displayPhone;
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
        opacity: isDragging && !isOverlay ? 0.4 : undefined,
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = primaryContact?.whatsapp || primaryContact?.phone || lead.phone;
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}`, "_blank");
        if (onQuickContact) onQuickContact(lead.id);
    };

    const handleEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        const email = primaryContact?.email || lead.email;
        if (!email) return;
        window.location.href = `mailto:${email}`;
        if (onQuickContact) onQuickContact(lead.id);
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

    const score = lead.score || 0;

    // RPG Tier Mapping (Sprint 12 Arena)
    const getTierConfig = () => {
        if (score >= 90) return { label: "LEGENDARY", class: "tier-legendary", badge: "bg-amber-500/20 text-amber-400 border-amber-500/50" };
        if (score >= 75) return { label: "DIAMOND", class: "tier-diamond", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" };
        if (score >= 60) return { label: "GOLD", class: "border-l-4 border-l-amber-500", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30" };
        if (score >= 40) return { label: "SILVER", class: "border-l-4 border-l-slate-400", badge: "bg-slate-500/10 text-slate-400 border-slate-500/30" };
        return { label: "BRONZE", class: "border-l-4 border-l-orange-800", badge: "bg-orange-900/10 text-orange-800 border-orange-800/30" };
    };

    const tier = getTierConfig();

    // Didactic Coach Logic
    const getCoachHint = () => {
        if (lead.status === 'NEW' && !lead.decision_maker) return "Identifique o decisor para acelerar a qualificação.";
        if (lead.status === 'MEETING' && !lead.contract_value) return "Tente estimar o valor do contrato durante a reunião.";
        if (lead.score && lead.score > 80 && lead.status !== 'WON') return "Lead quente! Priorize o fechamento ainda hoje.";
        return "Mantenha o histórico atualizado para melhor precisão da IA.";
    };

    // Last contact label
    const getLastContactLabel = () => {
        if (!lead.last_contact_date) return null;
        const date = new Date(lead.last_contact_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { text: "Hoje", color: "text-neon-green-soft font-medium" };
        if (diffDays === 1) return { text: "Ontem", color: "text-text-secondary" };
        if (diffDays < 7) return { text: `${diffDays}d atrás`, color: "text-text-muted" };
        return { text: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), color: "text-text-muted" };
    };

    const lastContact = getLastContactLabel();

    // Owner badge color
    const getOwnerColor = () => {
        if (lead.owner === 'joao') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        if (lead.owner === 'vitor') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        return 'bg-bg-surface text-text-muted border-border-subtle';
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <Card
                className={`
                    cursor-grab active:cursor-grabbing 
                    bg-bg-elevated/40 backdrop-blur-md rounded-sm shadow-sm
                    ${!isDragging && !isOverlay ? 'transition-all duration-300 hover:bg-white/5 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : ''}
                    ${isOverlay ? 'shadow-2xl ring-2 ring-accent/50 rotate-1' : ''}
                    ${lead.is_starred
                        ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'
                        : 'border-white/5'}
                    ${tier.class}
                `}
                onClick={() => !isEditingTitle && !isDragging && onEdit(lead)}
            >
                {/* Header Row */}
                <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start gap-2">
                        {/* Title */}
                        <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                                <div onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                                    <Input
                                        ref={inputRef}
                                        value={titleValue}
                                        onChange={e => setTitleValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={() => handleTitleSubmit()}
                                        className="h-6 text-sm py-0 px-1 bg-bg-surface border-accent/50 text-white w-full"
                                    />
                                </div>
                            ) : (
                                <CardTitle
                                    className="text-sm font-medium text-white truncate cursor-pointer hover:text-accent transition-colors"
                                    title="Duplo clique para editar"
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingTitle(true);
                                    }}
                                >
                                    {lead.trade_name || lead.company_name}
                                </CardTitle>
                            )}
                            {/* Contact Name */}
                            <div className="flex items-center gap-1 mt-1 text-xs">
                                {displayName ? (
                                    <>
                                        <span className="flex items-center gap-1 text-accent font-medium truncate">
                                            <User className="w-3 h-3 shrink-0" />
                                            {displayName}
                                        </span>
                                        {phoneDigits.length >= 4 && (
                                            <span className="text-[10px] text-text-muted bg-bg-surface px-1 rounded border border-border-subtle font-display ml-auto shrink-0">
                                                *{phoneDigits.slice(-4)}
                                            </span>
                                        )}
                                    </>
                                ) : displayPhone ? (
                                    <span className="flex items-center gap-1 text-text-muted truncate w-full">
                                        <Phone className="w-3 h-3 shrink-0" />
                                        {maskedPhone}
                                        {phoneDigits.length >= 4 && (
                                            <span className="text-[10px] text-text-muted bg-bg-surface px-1 rounded border border-border-subtle font-display ml-auto shrink-0">
                                                *{phoneDigits.slice(-4)}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-text-disabled italic">Sem contato</span>
                                )}
                            </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex gap-0.5 shrink-0" onPointerDown={e => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={`h-6 w-6 ${lead.is_starred ? 'text-amber-400' : 'text-text-muted hover:text-accent'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite?.(lead.id, !lead.is_starred);
                                }}
                                title={lead.is_starred ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                                <Star className={`w-3.5 h-3.5 ${lead.is_starred ? 'fill-amber-400 shadow-sm' : ''}`} />
                            </Button>

                            {onApprove && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-6 w-6 text-text-muted hover:text-neon-green-soft hover:bg-neon-green-bg"
                                    onClick={(e) => { e.stopPropagation(); onApprove(lead.id); }}
                                    title="Aprovar para Pipeline"
                                >
                                    <Check className="w-3 h-3" />
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-6 w-6 text-text-muted hover:text-accent"
                                onClick={handleSearch}
                                title="Pesquisar no Google"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </Button>

                            {lead.status === 'DISQUALIFIED' && onDelete ? (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-6 w-6 text-text-muted hover:text-neon-red-soft hover:bg-neon-red-bg"
                                    onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
                                    title="Mover para Lixeira"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            ) : onDisqualify && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-6 w-6 text-text-muted hover:text-neon-red-soft hover:bg-neon-red-bg"
                                    onClick={(e) => { e.stopPropagation(); onDisqualify(lead.id); }}
                                    title="Descartar Lead"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-3 pt-0">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-1.5 flex-wrap items-center">
                            {/* Meeting Sub-status */}
                            {lead.status === 'MEETING' && (
                                <Badge
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateMeetingType?.(lead.id, lead.meeting_type || '');
                                    }}
                                    className={cn(
                                        "h-6 px-2 font-black uppercase text-[9px] tracking-wider transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-sm",
                                        "bg-white border-white/20 text-[#1C1C1C]",
                                        !lead.meeting_type && "opacity-60 grayscale-[0.5]"
                                    )}
                                >
                                    {/* Status Dot */}
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mr-2 shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                        !lead.meeting_type ? "bg-slate-400" :
                                            lead.meeting_type === 'FOLLOW_UP' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" :
                                                lead.meeting_type === 'CONFIRMATION' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                                                    "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    )} />

                                    {!lead.meeting_type ? 'Agendamento' :
                                        lead.meeting_type === 'FOLLOW_UP' ? 'Follow Up Especial' :
                                            lead.meeting_type === 'CONFIRMATION' ? 'A Confirmar' :
                                                'Confirmada'}
                                </Badge>
                            )}
                        </div>

                        {onQuickContact && (
                            <div
                                className="flex items-center gap-1.5 cursor-pointer bg-bg-surface hover:bg-bg-hover px-2 py-1 rounded-full transition-colors border border-border-subtle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickContact(lead.id);
                                }}
                                title="Marcar contato feito hoje"
                            >
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${lastContact?.text === 'Hoje' ? 'bg-neon-green-soft border-neon-green-soft' : 'border-text-muted'}`}>
                                    {lastContact?.text === 'Hoje' && <Check className="w-2 h-2 text-bg-void" />}
                                </div>
                                <span className="text-[10px] text-text-muted">{lastContact?.text === 'Hoje' ? 'Feito' : 'Hoje?'}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer: Owner + Last Contact + Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle" onPointerDown={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            {/* Owner Badge */}
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${getOwnerColor()}`}
                                title={lead.owner === 'joao' ? 'João' : lead.owner === 'vitor' ? 'Vitor' : 'Sem dono'}
                            >
                                {lead.owner ? lead.owner.charAt(0).toUpperCase() : '?'}
                            </div>

                            {/* Last Activity */}
                            {lastContact ? (
                                <span className={`text-[10px] ${lastContact.color}`}>
                                    {lastContact.text}
                                </span>
                            ) : (
                                <span className="text-[10px] text-text-disabled">Sem atividade</span>
                            )}
                        </div>

                        {/* Quick Contact Buttons */}
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={`h-6 w-6 rounded-full ${!displayPhone ? 'opacity-30 pointer-events-none' : 'text-text-muted hover:text-neon-green-soft hover:bg-neon-green-bg'}`}
                                onClick={handleWhatsApp}
                                title="Abrir WhatsApp"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={`h-6 w-6 rounded-full ${!displayEmail ? 'opacity-30 pointer-events-none' : 'text-text-muted hover:text-neon-cyan-soft hover:bg-neon-cyan-bg'}`}
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
