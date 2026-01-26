"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MessageCircle, ExternalLink, User, Check, X, Pencil, Star } from "lucide-react";
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
}

export function KanbanCard({ lead, onEdit, onUpdateTitle, onDisqualify, onApprove, onQuickContact, onToggleFavorite, onDelete }: KanbanCardProps) {
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

    // Score-based styling (DS v2.0)
    const score = lead.score || 0;
    const getScoreBorderClass = () => {
        if (score >= 85) return "border-l-4 border-l-neon-green-soft";
        if (score >= 60) return "border-l-4 border-l-neon-yellow-soft";
        if (score > 0) return "border-l-4 border-l-neon-red-soft";
        return "";
    };

    const getScoreBadgeClass = () => {
        if (score >= 85) return "bg-neon-green-bg text-neon-green-soft border-neon-green/30";
        if (score >= 70) return "bg-neon-cyan-bg text-neon-cyan-soft border-neon-cyan/30";
        if (score >= 55) return "bg-neon-yellow-bg text-neon-yellow-soft border-neon-yellow/30";
        return "bg-bg-surface text-text-muted border-border-subtle";
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
                    bg-bg-elevated border border-border-subtle rounded-md
                    transition-all duration-150
                    hover:border-border-default hover:translate-y-[-2px]
                    ${getScoreBorderClass()}
                    ${lead.is_starred ? 'shadow-glow-accent' : ''}
                `}
                onClick={() => !isEditingTitle && onEdit(lead)}
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
                                    <span className="flex items-center gap-1 text-accent font-medium truncate">
                                        <User className="w-3 h-3 shrink-0" />
                                        {displayName}
                                    </span>
                                ) : displayPhone ? (
                                    <span className="flex items-center gap-1 text-text-muted truncate">
                                        <Phone className="w-3 h-3 shrink-0" />
                                        {maskedPhone}
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
                                className={`h-6 w-6 ${lead.is_starred ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite?.(lead.id, !lead.is_starred);
                                }}
                                title={lead.is_starred ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                                <Star className={`w-3.5 h-3.5 ${lead.is_starred ? 'fill-accent' : ''}`} />
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
                    {/* Score + Quick Contact Row */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 items-center">
                            {score > 0 && (
                                <Badge
                                    variant="outline"
                                    className={`font-display text-[10px] h-5 px-2 font-bold ${getScoreBadgeClass()}`}
                                >
                                    {score} pts
                                </Badge>
                            )}
                            {/* Contract Value Badge */}
                            {lead.contract_value && Number(lead.contract_value) > 0 && (
                                <Badge
                                    variant="outline"
                                    className="font-display text-[10px] h-5 px-2 font-bold bg-neon-green-bg text-neon-green border-neon-green/30"
                                >
                                    R$ {Number(lead.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
        </div>
    );
}
