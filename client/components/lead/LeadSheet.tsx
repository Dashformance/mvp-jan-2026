"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Save, Search, Linkedin, Globe, Mail, Phone, Instagram, Layers, Disc, Trash2, Target, MessageCircleIcon, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Added toast for validation feedback

/**
 * Visualizen DS v3.1 LeadSheet
 * Sheet Background: bg-base (#181818)
 * Input/Card sections: bg-elevated (#222222)
 * Primary Button: White bg, Black text
 */

interface Lead {
    id: string;
    company_name?: string;
    trade_name?: string;
    cnpj?: string;
    phone?: string;
    email?: string;
    instagram_url?: string;
    website_url?: string;
    render_quality?: 'GOOD' | 'MEDIUM' | 'BAD';
    status: string;
    uf?: string;
    city?: string;
    decision_maker?: string;
    decision_maker_title?: string;
    linkedin_url?: string;
    website?: string;
    notes?: string;
    owner?: string;
    source?: string;
    score?: number;
    checklist?: any;
}

interface LeadSheetProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedLead: any) => Promise<void>;
}

export function LeadSheet({ lead, isOpen, onClose, onSave }: LeadSheetProps) {
    const [formData, setFormData] = useState<Partial<Lead>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData({ ...lead });
        }
    }, [lead?.id]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(formData);
        setSaving(false);
        onClose();
    };

    const googleSearch = (term: string) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
    };

    if (!lead) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[500px] sm:max-w-[600px] overflow-y-auto bg-background border-l border-border">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl text-foreground">{formData.trade_name || formData.company_name || "Novo Lead"}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 flex-wrap">
                        {formData.cnpj && <span className="font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">{formData.cnpj}</span>}
                        {formData.uf && <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-md text-xs font-medium">{formData.uf}</span>}
                        {/* Owner Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${formData.owner === 'vitor' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-accent/10 text-accent'}`}>
                            {formData.owner === 'vitor' ? 'Vitor Nitz' : 'João'}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                {/* Quick Owner Switch */}
                <div className="absolute top-4 right-12">
                    <select
                        className="bg-muted text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-white/20 focus:border-white/30"
                        value={formData.owner || 'joao'}
                        onChange={(e) => handleChange('owner', e.target.value)}
                    >
                        <option value="joao">Responsável: João</option>
                        <option value="vitor">Responsável: Vitor Nitz</option>
                    </select>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[rgba(255,255,255,0.06)] p-1 rounded-full">
                        <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#8A8A8A]">Dados & Qualificação</TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-full data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#8A8A8A]">Notas & Histórico</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 py-6">

                        {/* Cadastro Rápido - Social & Marketing (Top Priority) */}
                        <div className="space-y-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                                <Search className="w-4 h-4 text-accent" /> Prospecção Rápida
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Instagram className="w-3 h-3" /> Instagram
                                    </Label>
                                    <Input
                                        value={formData.instagram_url || ''}
                                        onChange={e => handleChange('instagram_url', e.target.value)}
                                        className="h-10"
                                        placeholder="link do perfil"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Site
                                    </Label>
                                    <Input
                                        value={formData.website_url || ''}
                                        onChange={e => handleChange('website_url', e.target.value)}
                                        className="h-10"
                                        placeholder="www.exemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border">
                                <Label className="text-xs text-muted-foreground">Qualidade do Render</Label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'GOOD', label: 'Bom', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
                                        { id: 'MEDIUM', label: 'Médio', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
                                        { id: 'BAD', label: 'Ruim', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' }
                                    ].map((q) => (
                                        <Button
                                            key={q.id}
                                            variant="outline"
                                            size="sm"
                                            className={`flex-1 h-9 text-xs transition-all ${formData.render_quality === q.id ? q.color + ' border-current' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}`}
                                            onClick={() => handleChange('render_quality', q.id)}
                                        >
                                            {q.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Dados da Empresa */}
                        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
                            <h4 className="font-medium text-sm text-foreground">Identificação</h4>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Nome da Empresa / Fantasia</Label>
                                    <Input value={formData.trade_name || ''} onChange={e => handleChange('trade_name', e.target.value)} className="h-10" placeholder="Nome que aparece no Kanban" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Razão Social</Label>
                                    <Input value={formData.company_name || ''} onChange={e => handleChange('company_name', e.target.value)} className="h-10" placeholder="Opcional" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border mt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Cidade
                                        </Label>
                                        <Input
                                            value={formData.city || ''}
                                            onChange={e => handleChange('city', e.target.value)}
                                            className="h-10"
                                            placeholder="Ex: Itapema"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            UF
                                        </Label>
                                        <Input
                                            value={formData.uf || ''}
                                            onChange={e => handleChange('uf', e.target.value)}
                                            className="h-10"
                                            placeholder="Ex: SC"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-border mt-2">
                                    <Label className="text-xs text-muted-foreground">CNPJ</Label>
                                    <Input
                                        value={formData.cnpj || ''}
                                        onChange={e => handleChange('cnpj', e.target.value)}
                                        className="h-10 font-mono text-xs"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="notes" className="py-6">
                        <Label className="text-muted-foreground">Notas & Histórico</Label>
                        <Textarea
                            className="h-[300px] mt-2 bg-muted text-foreground placeholder:text-muted-foreground rounded-xl border-border focus:border-ring"
                            placeholder="Ex: Tentei contato dia 05/01, caixa postal. Enviei email de apresentação..."
                            value={formData.notes || ''}
                            onChange={e => handleChange('notes', e.target.value)}
                        />
                    </TabsContent>
                </Tabs>

                <SheetFooter className="mt-8 flex justify-between items-center w-full">
                    <Button
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => {
                            handleChange('status', 'DISQUALIFIED');
                            handleSave();
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Desqualificar
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
