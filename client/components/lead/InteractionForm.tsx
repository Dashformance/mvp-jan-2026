"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, Calendar, FileText, Send } from "lucide-react";
import { toast } from "sonner";

interface InteractionFormProps {
    leadId: string;
    onSuccess: () => void;
}

export function InteractionForm({ leadId, onSuccess }: InteractionFormProps) {
    const [type, setType] = useState('NOTE');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId, type, content })
            });
            if (res.ok) {
                setContent('');
                onSuccess();
                toast.success("Activity logged");
            } else {
                toast.error("Failed to log activity");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error logging activity");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex gap-2 items-center">
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NOTE">Nota</SelectItem>
                        <SelectItem value="CALL">Ligação</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="MEETING">Reunião</SelectItem>
                    </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground ml-auto">
                    {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>
            <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Descreva o que aconteceu..."
                className="min-h-[80px] text-sm bg-background resize-none focus-visible:ring-1"
            />
            <div className="flex justify-end">
                <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={loading || !content.trim()}>
                    <Send className="w-3 h-3 mr-2" />
                    Salvar
                </Button>
            </div>
        </div>
    );
}
