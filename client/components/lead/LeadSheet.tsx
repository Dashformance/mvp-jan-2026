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
import { ContactList } from "./ContactList";
import { Timeline } from "./Timeline";

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
    owner_id?: string;
    source?: string;
    score?: number;
    checklist?: any;
    extra_info?: any;
    contacts?: any[];
    contract_value?: number | string;
}

interface LeadSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedLead: any) => Promise<void>;
}

export function LeadSheet({ lead, open, onOpenChange, onSave }: LeadSheetProps) {
    const [formData, setFormData] = useState<Partial<Lead>>({});
    const [saving, setSaving] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableUsers(data);
                }
            } catch (err) {
                console.error("Failed to fetch users in LeadSheet", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (lead) {
            setFormData({ ...lead });
        }
    }, [lead]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };

            // If updating trade_name and company_name is empty, sync them
            if (field === 'trade_name' && !prev.company_name) {
                next.company_name = value;
            }
            // If updating company_name and trade_name is empty, sync them
            if (field === 'company_name' && !prev.trade_name) {
                next.trade_name = value;
            }

            return next;
        });
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
        onOpenChange(false);
    };

    const googleSearch = (term: string) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
    };

    if (!lead) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:max-w-[600px] overflow-y-auto bg-bg-surface border-l border-border-default p-8 shadow-2xl">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl text-text-primary tracking-tight">{formData.trade_name || formData.company_name || "Novo Lead"}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 flex-wrap mt-2">
                        {formData.cnpj && <span className="font-mono bg-bg-deep text-text-muted px-2 py-0.5 rounded-md text-xs">{formData.cnpj}</span>}
                        {formData.uf && <span className="bg-neon-cyan-bg text-neon-cyan px-2 py-0.5 rounded-md text-xs font-medium border border-neon-cyan/20">{formData.uf}</span>}
                        {/* Owner Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-muted text-accent border border-accent/20`}>
                            {availableUsers.find(u => u.id === formData.owner_id)?.name || formData.owner || 'Sem dono'}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                {/* Dynamic Owner Switch */}
                <div className="absolute top-4 right-12">
                    <Select
                        value={formData.owner_id || 'none'}
                        onValueChange={(val) => {
                            const user = availableUsers.find(u => u.id === val);
                            handleChange('owner_id', val === 'none' ? null : val);
                            if (user) handleChange('owner', user.name.split(' ')[0].toLowerCase());
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-7 bg-bg-elevated/80 text-[10px] uppercase font-bold text-text-muted border-border-subtle rounded-full px-3 py-1 outline-none">
                            <SelectValue placeholder="Responsável" />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-surface border-border-subtle text-white">
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {availableUsers.map(u => (
                                <SelectItem key={u.id} value={u.id} className="text-[10px] uppercase font-bold">
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-bg-deep p-1 h-11 rounded-xl border border-border-subtle">
                        <TabsTrigger
                            value="details"
                            className="rounded-lg data-[state=active]:bg-bg-primary data-[state=active]:text-accent data-[state=active]:shadow-sm text-text-muted h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Dados
                        </TabsTrigger>
                        <TabsTrigger
                            value="qualification"
                            className="rounded-lg data-[state=active]:bg-bg-primary data-[state=active]:text-accent data-[state=active]:shadow-sm text-text-muted h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Qualificação
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded-lg data-[state=active]:bg-bg-primary data-[state=active]:text-accent data-[state=active]:shadow-sm text-text-muted h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Histórico
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

                            </div>

                            {/* Contatos - Multiplos */}
                            <div className="space-y-1.5 pt-2">
                                <ContactList
                                    leadId={lead.id}
                                    initialContacts={formData.contacts}
                                    onChange={(newContacts) => handleChange('contacts', newContacts as any)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
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

                                {/* Valor do Contrato */}
                                <div className="space-y-1.5 pt-2 border-t border-border mt-2">
                                    <Label className="text-xs text-accent font-semibold flex items-center gap-1">
                                        💰 Valor do Contrato
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">R$</span>
                                        <Input
                                            type="text"
                                            value={formData.contract_value ? formData.contract_value.toString() : ''}
                                            onChange={(e) => {
                                                // Allow only numbers and one dot/comma
                                                let val = e.target.value;

                                                // Basic masking logic: allow digits and one comma/dot
                                                if (/^[\d.,]*$/.test(val)) {
                                                    handleChange('contract_value', val);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                // Format on blur
                                                let val = e.target.value.replace(/\./g, '').replace(',', '.');
                                                const hasComma = e.target.value.includes(',');

                                                // If user typed "1000", treat as 1000.00
                                                // If user typed "1000,50", treat as 1000.50
                                                const num = parseFloat(val);
                                                if (!isNaN(num)) {
                                                    // Store formatted string or keep raw? 
                                                    // Prisma expects Decimal (number/string).
                                                    // Let's store raw formatting for UI consistency if needed, 
                                                    // but LeadSanitizer will parse it to float.
                                                    // Better: Format to beautiful string.
                                                    handleChange('contract_value', num.toFixed(2));
                                                }
                                            }}
                                            className="h-10 pl-10 font-display text-lg text-neon-green-soft bg-neon-green-bg/30 border-neon-green/30 focus:border-neon-green"
                                            placeholder="0.00"
                                        />
                                    </div>
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

                    <TabsContent value="history" className="h-[430px] flex flex-col">
                        <div className="flex-1 -mt-2">
                            <Timeline leadId={lead.id} />
                        </div>
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
                        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet >
    );
}
