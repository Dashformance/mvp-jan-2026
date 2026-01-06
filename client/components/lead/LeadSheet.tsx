"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Save, Search, Linkedin, Globe, Mail, Phone } from "lucide-react";

/**
 * Visualizen DS v3.1 LeadSheet
 * Sheet Background: bg-base (#181818)
 * Input/Card sections: bg-elevated (#222222)
 * Primary Button: White bg, Black text
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
    city?: string;
    decision_maker?: string;
    decision_maker_title?: string;
    linkedin_url?: string;
    website?: string;
    notes?: string;
    owner?: string;
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

    const displayEmail = typeof formData.email === 'object' ? (formData.email as any)?.email : formData.email;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[500px] sm:max-w-[600px] overflow-y-auto bg-background border-l border-border">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl text-foreground">{formData.trade_name || formData.company_name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">{formData.cnpj}</span>
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
                        <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#8A8A8A]">Dados & Enriquecimento</TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-full data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#8A8A8A]">Notas & Anotações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 py-6">

                        {/* Dados de Contato */}
                        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                                <Phone className="w-4 h-4 text-muted-foreground" /> Contato
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Telefone / WhatsApp</Label>
                                    <div className="flex gap-2">
                                        <Input value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} className="h-10" />
                                        <Button size="icon-sm" variant="outline" onClick={() => window.open(`https://wa.me/55${formData.phone?.replace(/\D/g, '')}`, '_blank')} disabled={!formData.phone}>
                                            <MessageCircleIcon className="w-4 h-4 text-green-400" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <div className="flex gap-2">
                                        <Input value={displayEmail || ''} onChange={e => handleChange('email', e.target.value)} className="h-10" />
                                        <Button size="icon-sm" variant="outline" onClick={() => window.location.href = `mailto:${displayEmail}`} disabled={!displayEmail}>
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Site</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="www.empresa.com.br" value={formData.website || ''} onChange={e => handleChange('website', e.target.value)} className="h-10" />
                                        <Button size="icon-sm" variant="outline" onClick={() => window.open(`http://${formData.website}`, '_blank')} disabled={!formData.website}>
                                            <Globe className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="linkedin.com/in/..." value={formData.linkedin_url || ''} onChange={e => handleChange('linkedin_url', e.target.value)} className="h-10" />
                                        <Button size="icon-sm" variant="outline" onClick={() => window.open(formData.linkedin_url || '', '_blank')} disabled={!formData.linkedin_url}>
                                            <Linkedin className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decisor */}
                        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-accent/20">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-accent">
                                <Search className="w-4 h-4" /> Enriquecimento (Decisor)
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Nome do Decisor</Label>
                                    <Input placeholder="Ex: João Silva" value={formData.decision_maker || ''} onChange={e => handleChange('decision_maker', e.target.value)} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Cargo</Label>
                                    <Input placeholder="Ex: Sócio / Diretor" value={formData.decision_maker_title || ''} onChange={e => handleChange('decision_maker_title', e.target.value)} className="h-10" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button variant="secondary" size="sm" className="text-xs w-full" onClick={() => googleSearch(`${formData.company_name} ${formData.uf || ''} sócio linkedin`)}>
                                    <Search className="w-3 h-3 mr-2" /> Buscar Sócio no Google
                                </Button>
                                <Button variant="secondary" size="sm" className="text-xs w-full" onClick={() => googleSearch(`site:linkedin.com/in/ ${formData.company_name} ${formData.uf || ''}`)}>
                                    <Linkedin className="w-3 h-3 mr-2" /> Buscar no LinkedIn
                                </Button>
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

                <SheetFooter className="mt-8 gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function MessageCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
    )
}
