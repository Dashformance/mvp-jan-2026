"use client";
import { useEffect, useState } from 'react';
import { InteractionForm } from './InteractionForm';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Mail, MessageCircle, Calendar, FileText, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimelineProps {
    leadId: string;
}

const ICONS = {
    CALL: Phone,
    EMAIL: Mail,
    WHATSAPP: MessageCircle,
    MEETING: Calendar,
    NOTE: FileText,
    STATUS_CHANGE: Clock
};

const COLORS: any = {
    CALL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    EMAIL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    WHATSAPP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MEETING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    NOTE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    STATUS_CHANGE: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
};

const LABELS: any = {
    CALL: "Ligação",
    EMAIL: "Email",
    WHATSAPP: "WhatsApp",
    MEETING: "Reunião",
    NOTE: "Nota",
    STATUS_CHANGE: "Mudança de Status"
};

export function Timeline({ leadId }: TimelineProps) {
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInteractions = async () => {
        try {
            const res = await fetch(`/api/interactions?lead_id=${leadId}`);
            if (res.ok) {
                const data = await res.json();
                setInteractions(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInteractions();
    }, [leadId]);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja apagar este registro?')) return;
        try {
            const res = await fetch(`/api/interactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setInteractions(prev => prev.filter(i => i.id !== id));
                toast.success("Registro apagado");
            }
        } catch (e) {
            toast.error("Erro ao apagar");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <InteractionForm leadId={leadId} onSuccess={fetchInteractions} />

            <div className="flex-1 mt-4 relative min-h-[200px]">
                <div className="absolute left-4 top-2 bottom-0 w-px bg-border/40" />
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6 pb-4 pt-2">
                        {interactions.map((item) => {
                            const Icon = ICONS[item.type as keyof typeof ICONS] || FileText;
                            const colorClass = COLORS[item.type as keyof typeof COLORS] || "bg-muted";
                            const label = LABELS[item.type as keyof typeof LABELS] || item.type;

                            return (
                                <div key={item.id} className="relative pl-10 group">
                                    <div className={`absolute left-1 top-0 w-6 h-6 rounded-full border flex items-center justify-center bg-background z-10 ${colorClass}`}>
                                        <Icon className="w-3 h-3" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs text-muted-foreground flex gap-2 items-center">
                                                <span className="font-medium text-foreground">{label}</span>
                                                <span className="flex items-center gap-1 opacity-70">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="whitespace-pre-wrap text-foreground/90 bg-muted/30 p-2.5 rounded-md border border-border/50 text-xs leading-relaxed">
                                            {item.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {interactions.length === 0 && !loading && (
                            <div className="text-center text-xs text-muted-foreground py-8 pl-8 italic">
                                Nenhuma atividade registrada.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
