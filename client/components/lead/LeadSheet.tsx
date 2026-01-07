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
import { QualificationForm } from "./QualificationForm";
import { toast } from "sonner";

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
    extra_info?: any;
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

        // Validation with feedback
        const cleanedData = { ...formData };
        const warnings: string[] = [];

        // Phone validation: only numbers allowed
        if (cleanedData.phone && !/^[\d\s\-\(\)\+]+$/.test(cleanedData.phone)) {
            warnings.push("📞 Telefone: aceita apenas números. Campo limpo.");
            cleanedData.phone = '';
        }

        // Email validation
        if (cleanedData.email && cleanedData.email !== '-' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedData.email)) {
            warnings.push("📧 Email: formato inválido. Campo limpo.");
            cleanedData.email = '';
        }

        // URL validations (Instagram/Site)
        const urlPattern = /^(https?:\/\/|www\.)/i;
        if (cleanedData.instagram_url && cleanedData.instagram_url !== '-' && !urlPattern.test(cleanedData.instagram_url) && !cleanedData.instagram_url.includes('instagram')) {
            warnings.push("📸 Instagram: use o link completo do perfil. Campo limpo.");
            cleanedData.instagram_url = '';
        }

        if (cleanedData.website_url && cleanedData.website_url !== '-' && !urlPattern.test(cleanedData.website_url) && !cleanedData.website_url.includes('.')) {
            warnings.push("🌐 Site: use o link completo (ex: www.site.com). Campo limpo.");
            cleanedData.website_url = '';
        }

        // Show warnings
        if (warnings.length > 0) {
            warnings.forEach(w => toast.warning(w, { duration: 4000 }));
        }

        await onSave(cleanedData);
        setSaving(false);
        onClose();
    };

    const googleSearch = (term: string) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
    };

    if (!lead) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[500px] sm:max-w-[600px] overflow-y-auto bg-background border-l border-border p-8">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl text-foreground">{formData.trade_name || formData.company_name || "Novo Lead"}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 flex-wrap mt-2">
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
                    <TabsList className="grid w-full grid-cols-3 bg-muted p-1 h-11 rounded-xl">
                        <TabsTrigger
                            value="details"
                            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground h-9 text-xs"
                        >
                            Dados
                        </TabsTrigger>
                        <TabsTrigger
                            value="qualification"
                            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground h-9 text-xs"
                        >
                            Qualificação
                        </TabsTrigger>
                        <TabsTrigger
                            value="notes"
                            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground h-9 text-xs"
                        >
                            Notas
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 py-4">

                        {/* Cadastro Rápido - Social & Marketing (Top Priority) */}
                        <div className="space-y-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                                <Search className="w-4 h-4 text-accent" /> Prospecção Rápida
                            </h4>
                            <div className="space-y-3">
                                {/* Nome da Empresa */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        Nome da Empresa
                                    </Label>
                                    <Input
                                        value={formData.trade_name || ''}
                                        onChange={e => handleChange('trade_name', e.target.value)}
                                        className="h-10"
                                        placeholder="Nome Fantasia"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> Whatsapp
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.phone || ''}
                                                onChange={e => handleChange('phone', e.target.value)}
                                                className="h-10"
                                                placeholder="(00) 00000-0000"
                                            />
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                disabled={!formData.phone}
                                                onClick={() => {
                                                    const num = formData.phone?.replace(/\D/g, '') || '';
                                                    if (num) window.open(`https://wa.me/55${num}`, '_blank');
                                                }}
                                            >
                                                <MessageCircleIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Email
                                        </Label>
                                        <Input
                                            value={formData.email || ''}
                                            onChange={e => handleChange('email', e.target.value)}
                                            className="h-10"
                                            placeholder="contato@empresa.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Instagram className="w-3 h-3" /> Instagram
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.instagram_url || ''}
                                                onChange={e => handleChange('instagram_url', e.target.value)}
                                                className="h-10"
                                                placeholder="link do perfil"
                                            />
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 shrink-0 hover:text-pink-400 hover:border-pink-500/30"
                                                disabled={!formData.instagram_url}
                                                onClick={() => formData.instagram_url && window.open(formData.instagram_url, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Site
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.website_url || ''}
                                                onChange={e => handleChange('website_url', e.target.value)}
                                                className="h-10"
                                                placeholder="www.exemplo.com"
                                            />
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 shrink-0 hover:text-blue-400 hover:border-blue-500/30"
                                                disabled={!formData.website_url}
                                                onClick={() => {
                                                    let url = formData.website_url;
                                                    if (url && !url.startsWith('http')) url = 'https://' + url;
                                                    if (url) window.open(url, '_blank')
                                                }}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
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
                                {/* Removido Nome Fantasia daqui pois já está no card acima */}

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

                    <TabsContent value="qualification" className="py-4">
                        <QualificationForm
                            data={(formData.extra_info as any)?.qualification || {}}
                            onChange={(qData) => {
                                const currentExtra = (formData.extra_info as any) || {};
                                setFormData(prev => ({
                                    ...prev,
                                    extra_info: {
                                        ...currentExtra,
                                        qualification: qData
                                    }
                                }));
                            }}
                            leadData={formData}
                        />
                    </TabsContent>

                    <TabsContent value="notes" className="py-4">
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
