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
            <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto bg-[#1C1C1C] border-l border-white/10 p-8 shadow-2xl">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl text-text-primary tracking-tight">{formData.trade_name || formData.company_name || "Novo Lead"}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 flex-wrap mt-2">
                        {formData.cnpj && <span className="font-mono bg-[#222222] text-[#888888] px-2 py-0.5 rounded-full text-[10px] border border-white/5">{formData.cnpj}</span>}
                        {formData.uf && <span className="bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded-full text-[10px] font-medium border border-neon-cyan/20">{formData.uf}</span>}
                        {/* Owner Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DECCA8]/10 text-[#DECCA8] border border-[#DECCA8]/20`}>
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
                        <SelectTrigger className="w-[140px] h-7 bg-[#222222] text-[10px] uppercase font-bold text-[#888888] border-white/10 rounded-full px-3 py-1 outline-none hover:bg-[#2A2A2A] transition-colors">
                            <SelectValue placeholder="Responsável" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-white/10 text-white shadow-xl">
                            <SelectItem value="none" className="focus:bg-[#2A2A2A] focus:text-white">Sem responsável</SelectItem>
                            {availableUsers.map(u => (
                                <SelectItem key={u.id} value={u.id} className="text-[10px] uppercase font-bold">
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs defaultValue="contact" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-[#181818] p-1 h-11 rounded-lg border border-white/5 overflow-x-auto custom-scrollbar">
                        <TabsTrigger
                            value="contact"
                            className="rounded-md data-[state=active]:bg-[#222222] data-[state=active]:text-[#DECCA8] data-[state=active]:shadow-sm text-[#888888] h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Contato
                        </TabsTrigger>
                        <TabsTrigger
                            value="qualification"
                            className="rounded-md data-[state=active]:bg-[#222222] data-[state=active]:text-[#DECCA8] data-[state=active]:shadow-sm text-[#888888] h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Status
                        </TabsTrigger>
                        <TabsTrigger
                            value="details"
                            className="rounded-md data-[state=active]:bg-[#222222] data-[state=active]:text-[#DECCA8] data-[state=active]:shadow-sm text-[#888888] h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Detalhes
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded-md data-[state=active]:bg-[#222222] data-[state=active]:text-[#DECCA8] data-[state=active]:shadow-sm text-[#888888] h-9 text-xs font-semibold uppercase tracking-wide"
                        >
                            Histórico
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="space-y-4 py-4">

                        {/* Cadastro Rápido - Social & Marketing (Top Priority) */}
                        <div className="space-y-5 p-6 bg-[#222222] rounded-xl border border-white/5 shadow-sm">
                            <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-white/90">
                                <Search className="w-4 h-4 text-[#DECCA8]" /> Prospecção Rápida
                            </h4>
                            <div className="space-y-3">
                                {/* Nome da Empresa */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] flex items-center gap-1">
                                        Nome da Empresa
                                    </Label>
                                    <Input
                                        value={formData.trade_name || ''}
                                        onChange={e => handleChange('trade_name', e.target.value)}
                                        className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
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

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] flex items-center gap-1">
                                        <Instagram className="w-3 h-3" /> Instagram
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.instagram_url || ''}
                                            onChange={e => handleChange('instagram_url', e.target.value)}
                                            className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                            placeholder="link do perfil"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 shrink-0 bg-[#1C1C1C] border border-white/10 text-[#888888] hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/30"
                                            disabled={!formData.instagram_url}
                                            onClick={() => formData.instagram_url && window.open(formData.instagram_url, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Site
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.website_url || ''}
                                            onChange={e => handleChange('website_url', e.target.value)}
                                            className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                            placeholder="www.exemplo.com"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 shrink-0 bg-[#1C1C1C] border border-white/10 text-[#888888] hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30"
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

                            <div className="space-y-3 pt-2">
                                <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888]">Qualidade do Render</Label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'GOOD', label: 'Bom', color: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' },
                                        { id: 'MEDIUM', label: 'Médio', color: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' },
                                        { id: 'BAD', label: 'Ruim', color: 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30' }
                                    ].map((q) => (
                                        <Button
                                            key={q.id}
                                            variant="ghost"
                                            size="sm"
                                            className={`flex-1 h-9 text-xs transition-all ${formData.render_quality === q.id ? q.color : 'bg-[#1C1C1C] border border-white/5 text-[#888888] hover:bg-[#2A2A2A]'}`}
                                            onClick={() => handleChange('render_quality', q.id)}
                                        >
                                            {q.label}
                                        </Button>
                                    ))}
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

                    <TabsContent value="details" className="space-y-4 py-4">
                        {/* Dados da Empresa */}
                        <div className="space-y-5 p-6 bg-[#222222] rounded-xl border border-white/5 shadow-sm mt-4">
                            <h4 className="font-display font-semibold text-sm text-white/90">Identificação</h4>
                            <div className="space-y-3">
                                {/* Removido Nome Fantasia daqui pois já está no card acima */}

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888]">Razão Social</Label>
                                    <Input
                                        value={formData.company_name || ''}
                                        onChange={e => handleChange('company_name', e.target.value)}
                                        className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Cidade
                                        </Label>
                                        <Input
                                            value={formData.city || ''}
                                            onChange={e => handleChange('city', e.target.value)}
                                            className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                            placeholder="Ex: Itapema"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] flex items-center gap-1">
                                            UF
                                        </Label>
                                        <Input
                                            value={formData.uf || ''}
                                            onChange={e => handleChange('uf', e.target.value)}
                                            className="h-10 bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                            placeholder="Ex: SC"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888]">CNPJ</Label>
                                    <Input
                                        value={formData.cnpj || ''}
                                        onChange={e => handleChange('cnpj', e.target.value)}
                                        className="h-10 font-mono text-xs bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8]/50 text-white placeholder:text-[#444444]"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-6 bg-[#222222] rounded-xl border border-white/5 shadow-sm mt-4">
                            <h4 className="font-display font-semibold text-sm text-white/90">Status de Fechamento</h4>
                            {/* Valor do Contrato */}
                            <div className="space-y-1.5 pt-2 mt-2">
                                <Label className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#DECCA8] flex items-center gap-1">
                                    💰 Valor do Contrato
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">R$</span>
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
                                        className="h-10 pl-10 font-display text-lg text-white bg-[#1C1C1C] border-white/10 focus:border-[#DECCA8] placeholder:text-[#444444]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
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
                        <Button variant="secondary" className="bg-[#222222] border-white/10 hover:bg-[#2A2A2A] text-white" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-[#DECCA8] text-[#0F0F0F] hover:bg-[#E0D4BA] font-semibold">
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent >
        </Sheet >
    );
}
