"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadZone } from "./UploadZone";
import { MappingEditor } from "./MappingEditor";
import { Loader2, Check, ChevronRight, AlertCircle, Building2, User, Phone, Mail, MapPin, Globe, Instagram, FileText, ChevronDown, ChevronUp, Pencil, X, AlertTriangle, Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { useKanban } from "@/components/kanban/kanban-context";
import { useAuth } from "@/context/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ImportWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Contact {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
    is_primary?: boolean;
}

interface ParsedLead {
    company_name?: string;
    trade_name?: string;
    website_url?: string;
    instagram_url?: string;
    city?: string;
    uf?: string;
    address?: string;
    notes?: string;
    source?: string;
    owner_id?: string;
    stage_id?: string;
    contacts?: Contact[];
    // Duplicate detection fields (added client-side)
    _isDuplicate?: boolean;
    _matchReasons?: string[];
}

type Step = 'UPLOAD' | 'MAPPING' | 'TEXT_REVIEW' | 'IMPORTING' | 'SUCCESS';

export function ImportWizard({ open, onOpenChange }: ImportWizardProps) {
    const { fetchLeads, columns } = useKanban();
    const { user, profile } = useAuth();
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetch('/api/users')
                .then(res => res.ok ? res.json() : [])
                .then(data => setAvailableUsers(data))
                .catch(err => console.error("Failed to fetch users", err));
        }
    }, [open]);

    // Auto-select first stage or 'NEW' when columns load
    useEffect(() => {
        if (columns.length > 0 && !globalStageId) {
            const hasNewField = columns.some(c => c.id === 'NEW');
            setGlobalStageId(hasNewField ? 'NEW' : columns[0].id);
        }
    }, [columns, globalStageId]);

    // Auto-select current user as default owner
    useEffect(() => {
        if (profile?.id && !globalOwnerId) {
            setGlobalOwnerId(profile.id);
        }
    }, [profile, globalOwnerId]);

    const [step, setStep] = useState<Step>('UPLOAD');

    // Global Import States
    const [globalStageId, setGlobalStageId] = useState<string>('');
    const [globalOwnerId, setGlobalOwnerId] = useState<string>('');
    const [globalSource, setGlobalSource] = useState<string>('Import');

    // File Import State
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [fullData, setFullData] = useState<any[]>([]);

    // Text Import State
    const [textInput, setTextInput] = useState("");
    const [aiSummary, setAiSummary] = useState("");
    const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
    const [editingLeadIndex, setEditingLeadIndex] = useState<number | null>(null);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

    // Common State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string>();
    const [importStats, setImportStats] = useState({ imported: 0, errors: 0, errorDetails: [] as any[] });
    const [loadingMessage, setLoadingMessage] = useState("Iniciando...");

    // Loading Messages Effect
    useEffect(() => {
        if (!isAnalyzing) return;

        const messages = [
            "Conectando com a IA...",
            "Lendo e interpretando texto...",
            "Identificando empresas...",
            "Extraindo contatos...",
            "Organizando dados estruturados...",
            "Verificando duplicatas...",
            "Finalizando..."
        ];

        let i = 0;
        setLoadingMessage(messages[0]);

        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMessage(messages[i]);
            // Stop at last message (don't loop back to start)
            if (i === messages.length - 1) clearInterval(interval);
        }, 2000); // 2 seconds per message

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const reset = () => {
        setStep('UPLOAD');
        setFile(null);
        setTextInput("");
        setAiSummary("");
        setParsedLeads([]);
        setEditingLeadIndex(null);
        setHeaders([]);
        setMapping({});
        setFullData([]);
        setIsAnalyzing(false);
        setAnalysisError(undefined);
    };

    // TEXT IMPORT HANDLERS
    const handleTextAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisError(undefined);
        try {
            const res = await fetch('/api/import/parse-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Falha ao processar texto");

            const leadsData = data.leads || [];

            // Check for duplicates
            const dupRes = await fetch('/api/import/check-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: leadsData })
            });
            const dupData = await dupRes.json();

            // Merge duplicate info into leads AND apply global stage/owner
            const leadsWithDupInfo = leadsData.map((lead: ParsedLead, idx: number) => {
                const dupInfo = dupData.results?.find((r: any) => r.index === idx);
                return {
                    ...lead,
                    stage_id: globalStageId || 'NEW',
                    owner_id: globalOwnerId || profile?.id || '',
                    source: globalSource || 'Import',
                    _isDuplicate: dupInfo?.isDuplicate || false,
                    _matchReasons: dupInfo?.matchReasons || []
                };
            });

            setDuplicateCount(dupData.duplicates || 0);
            let summary = data.summary || `Encontrei ${leadsData.length} leads.`;
            if (dupData.duplicates > 0) {
                summary += ` ⚠️ ${dupData.duplicates} possíveis duplicatas.`;
            }
            setAiSummary(summary);
            setParsedLeads(leadsWithDupInfo);
            setStep('TEXT_REVIEW');
        } catch (err: any) {
            setAnalysisError(err.message || "Erro na IA");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmTextImport = async () => {
        setStep('IMPORTING');
        try {
            // Apply global fields to all leads before sending
            const leadsToImport = parsedLeads.map(lead => ({
                ...lead,
                stage_id: lead.stage_id || globalStageId || 'NEW',
                source: lead.source || globalSource || 'Import'
            }));

            console.log('[ImportWizard] Sending leads with stage_id:', leadsToImport[0]?.stage_id);

            const res = await fetch('/api/import/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: leadsToImport })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setImportStats({ imported: data.imported, errors: data.errors, errorDetails: data.errorDetails || [] });
            setStep('SUCCESS');
            toast.success("Importação concluída!");
            fetchLeads(1);
        } catch (err: any) {
            toast.error("Erro ao importar", { description: err.message });
            setStep('TEXT_REVIEW');
        }
    };

    const updateLead = (index: number, updates: Partial<ParsedLead>) => {
        setParsedLeads(prev => prev.map((l, i) => i === index ? { ...l, ...updates } : l));
    };

    const saveAndRecheck = async (index: number) => {
        const lead = parsedLeads[index];
        setEditingLeadIndex(null); // Close edit mode first

        try {
            // Recheck duplicate for this specific lead
            const dupRes = await fetch('/api/import/check-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: [lead] })
            });
            const dupData = await dupRes.json();

            // Single result at index 0
            const dupInfo = dupData.results?.[0];

            updateLead(index, {
                _isDuplicate: dupInfo?.isDuplicate || false,
                _matchReasons: dupInfo?.matchReasons || []
            });

            if (dupInfo?.isDuplicate) {
                toast.warning("Ainda parece ser uma duplicata.");
            } else {
                toast.success("Lead atualizado e validado!");
            }
        } catch (err) {
            console.error("Recheck failed", err);
        }
    };

    const removeLead = (index: number) => {
        setParsedLeads(prev => prev.filter((_, i) => i !== index));
    };

    // FILE IMPORT HANDLERS
    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsAnalyzing(true);
        setAnalysisError(undefined);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/import/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Falha na análise");

            setHeaders(data.headers);
            setMapping(data.mapping);
            setFullData(data.fullData);
            setStep('MAPPING');
        } catch (err: any) {
            setAnalysisError(err.message || "Falha na análise");
            setFile(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmFileImport = async () => {
        setStep('IMPORTING');
        try {
            const res = await fetch('/api/import/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: fullData, mapping })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Falha na importação");

            setImportStats({ imported: data.imported, errors: data.errors, errorDetails: data.errorDetails || [] });
            setStep('SUCCESS');
            toast.success("Importação concluída!");
            fetchLeads(1);
        } catch (err: any) {
            toast.error("Erro ao importar", { description: err.message });
            setStep('MAPPING');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(reset, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`bg-[#141414] border-white/10 text-white flex flex-col ${step === 'TEXT_REVIEW' ? 'max-w-[95vw] w-[95vw] h-[80vh]' : 'max-w-4xl'}`}>
                <DialogHeader>
                    <DialogTitle className="text-xl">Importar Leads</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 'UPLOAD' && "Escolha como deseja importar seus leads."}
                        {step === 'MAPPING' && "Confirme o mapeamento das colunas do arquivo."}
                        {step === 'TEXT_REVIEW' && aiSummary}
                        {step === 'IMPORTING' && "Processando dados..."}
                        {step === 'SUCCESS' && "Processo finalizado!"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 py-4 overflow-hidden">
                    {/* STEP: UPLOAD */}
                    {step === 'UPLOAD' && (
                        <div className="flex flex-col gap-4">
                            <UploadZone
                                onFileSelect={handleFileSelect}
                                isAnalyzing={isAnalyzing}
                                error={analysisError}
                            />

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#141414] px-2 text-muted-foreground">Ou cole texto</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <textarea
                                    className="w-full h-24 bg-[#181818] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                    placeholder="Cole aqui os dados de leads (pode ser texto desestruturado com várias empresas...)"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    disabled={isAnalyzing}
                                />
                                <div className="flex justify-end items-center gap-3">
                                    {isAnalyzing && (
                                        <span className="text-xs text-muted-foreground animate-pulse">
                                            {loadingMessage}
                                        </span>
                                    )}
                                    <Button
                                        variant="secondary"
                                        onClick={handleTextAnalyze}
                                        disabled={!textInput.trim() || isAnalyzing}
                                        className="min-w-[160px]"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Processando...
                                            </>
                                        ) : (
                                            "Processar com IA ✨"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP: MAPPING (File Import) */}
                    {step === 'MAPPING' && (
                        <ScrollArea className="h-full pr-4">
                            <MappingEditor
                                fileHeaders={headers}
                                mapping={mapping}
                                onMappingChange={setMapping}
                            />
                        </ScrollArea>
                    )}

                    {/* STEP: TEXT_REVIEW (Two-Column) */}
                    {step === 'TEXT_REVIEW' && (
                        <div className="grid grid-cols-2 gap-4 h-full min-h-0">
                            {/* Left: Original Text */}
                            <div className="flex flex-col gap-2 min-h-0">
                                <Label className="text-xs uppercase text-muted-foreground shrink-0">Texto Original</Label>
                                <ScrollArea className="flex-1 bg-[#181818] border border-white/10 rounded-xl p-4">
                                    <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">{textInput}</pre>
                                </ScrollArea>
                            </div>

                            {/* Right: Extracted Leads with Global Controls */}
                            <div className="flex flex-col gap-3 min-h-0 h-full">
                                {/* Global Bulk Actions Bar */}
                                <div className="bg-[#181818] border border-white/10 rounded-xl p-3 shrink-0 grid grid-cols-3 gap-3">
                                    {/* Owner Select */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase">Responsável</Label>
                                        <div className="relative">
                                            <Select
                                                value={globalOwnerId}
                                                onValueChange={(value) => {
                                                    setGlobalOwnerId(value);
                                                    const newLeads = parsedLeads.map(l => ({ ...l, owner_id: value }));
                                                    setParsedLeads(newLeads);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs text-white">
                                                    <SelectValue placeholder="Sem atribuição" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#181818] border-white/10 text-white">
                                                    <SelectItem value="none">Sem atribuição</SelectItem>
                                                    {availableUsers.map(u => (
                                                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Stage Select */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase">Etapa do Pipeline</Label>
                                        <div className="relative">
                                            <Select
                                                value={globalStageId}
                                                onValueChange={(value) => {
                                                    setGlobalStageId(value);
                                                    const newLeads = parsedLeads.map(l => ({ ...l, stage_id: value }));
                                                    setParsedLeads(newLeads);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs text-white">
                                                    <SelectValue placeholder="Selecione a etapa" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#181818] border-white/10 text-white">
                                                    {columns.map(col => (
                                                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Source Select */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase">Fonte</Label>
                                        <div className="relative">
                                            <Select
                                                value={globalSource}
                                                onValueChange={(value) => {
                                                    setGlobalSource(value);
                                                    const newLeads = parsedLeads.map(l => ({ ...l, source: value }));
                                                    setParsedLeads(newLeads);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs text-white">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#181818] border-white/10 text-white">
                                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                                    <SelectItem value="Google">Google</SelectItem>
                                                    <SelectItem value="Indicação">Indicação</SelectItem>
                                                    <SelectItem value="DWV">DWV</SelectItem>
                                                    <SelectItem value="Outros">Outros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between shrink-0 px-1">
                                    <Label className="text-xs uppercase text-muted-foreground">Leads ({parsedLeads.length})</Label>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-3 pb-4">
                                        {parsedLeads.map((lead, idx) => (
                                            <div
                                                key={idx}
                                                className={`bg-white/5 border rounded-xl p-4 transition-all ${lead._isDuplicate ? 'border-orange-500/50 bg-orange-500/5' : editingLeadIndex === idx ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Building2 className="w-4 h-4 text-amber-500" />
                                                        <h4 className="font-medium text-white">{lead.company_name || 'Sem Nome'}</h4>
                                                        {lead._isDuplicate && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30" title={lead._matchReasons?.join(', ')}>
                                                                <Copy className="w-3 h-3" />
                                                                Duplicata
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {editingLeadIndex === idx ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                                                onClick={() => saveAndRecheck(idx)}
                                                                title="Salvar e Validar"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                                                                onClick={() => setEditingLeadIndex(idx)}
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-400"
                                                            onClick={() => removeLead(idx)}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {editingLeadIndex === idx ? (
                                                    <div className="space-y-3">
                                                        {/* Row 1: Empresa */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-muted-foreground">Empresa</Label>
                                                            <Input
                                                                value={lead.company_name || ''}
                                                                onChange={(e) => updateLead(idx, { company_name: e.target.value })}
                                                                className="h-7 text-xs bg-white/5 border-white/10"
                                                            />
                                                        </div>

                                                        {/* Row 2: Cidade, UF, Endereço */}
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">Cidade</Label>
                                                                <Input
                                                                    value={lead.city || ''}
                                                                    onChange={(e) => updateLead(idx, { city: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">UF</Label>
                                                                <Input
                                                                    value={lead.uf || ''}
                                                                    onChange={(e) => updateLead(idx, { uf: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                    maxLength={2}
                                                                />
                                                            </div>
                                                            <div className="col-span-2 space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">Endereço</Label>
                                                                <Input
                                                                    value={lead.address || ''}
                                                                    onChange={(e) => updateLead(idx, { address: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Row 3: Site, Instagram, Fonte */}
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">Site</Label>
                                                                <Input
                                                                    value={lead.website_url || ''}
                                                                    onChange={(e) => updateLead(idx, { website_url: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">Instagram</Label>
                                                                <Input
                                                                    value={lead.instagram_url || ''}
                                                                    onChange={(e) => updateLead(idx, { instagram_url: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-muted-foreground">Fonte</Label>
                                                                <Input
                                                                    value={lead.source || ''}
                                                                    onChange={(e) => updateLead(idx, { source: e.target.value })}
                                                                    className="h-7 text-xs bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Row 4: Observações */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-muted-foreground">Observações</Label>
                                                            <Input
                                                                value={lead.notes || ''}
                                                                onChange={(e) => updateLead(idx, { notes: e.target.value })}
                                                                className="h-7 text-xs bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                        {/* Contatos (EDITABLE) */}
                                                        <div className="pt-2 border-t border-white/10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Label className="text-[10px] text-muted-foreground">Contatos ({lead.contacts?.length || 0})</Label>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {lead.contacts?.map((c: any, ci: number) => (
                                                                    <div key={ci} className="grid grid-cols-12 gap-2 items-start bg-white/5 p-2 rounded-lg">
                                                                        <div className="col-span-4 space-y-0.5">
                                                                            <Input
                                                                                placeholder="Nome"
                                                                                value={c.name}
                                                                                onChange={(e) => {
                                                                                    const newContacts = [...(lead.contacts || [])];
                                                                                    newContacts[ci] = { ...newContacts[ci], name: e.target.value };
                                                                                    updateLead(idx, { contacts: newContacts });
                                                                                }}
                                                                                className="h-6 text-[10px] px-2 bg-transparent border-white/10"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-3 space-y-0.5">
                                                                            <Input
                                                                                placeholder="Cargo"
                                                                                value={c.role || ''}
                                                                                onChange={(e) => {
                                                                                    const newContacts = [...(lead.contacts || [])];
                                                                                    newContacts[ci] = { ...newContacts[ci], role: e.target.value };
                                                                                    updateLead(idx, { contacts: newContacts });
                                                                                }}
                                                                                className="h-6 text-[10px] px-2 bg-transparent border-white/10"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 space-y-0.5">
                                                                            <Input
                                                                                placeholder="Tel"
                                                                                value={c.phone || ''}
                                                                                onChange={(e) => {
                                                                                    const newContacts = [...(lead.contacts || [])];
                                                                                    newContacts[ci] = { ...newContacts[ci], phone: e.target.value };
                                                                                    updateLead(idx, { contacts: newContacts });
                                                                                }}
                                                                                className="h-6 text-[10px] px-2 bg-transparent border-white/10"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-3 space-y-0.5">
                                                                            <Input
                                                                                placeholder="Email"
                                                                                value={c.email || ''}
                                                                                onChange={(e) => {
                                                                                    const newContacts = [...(lead.contacts || [])];
                                                                                    newContacts[ci] = { ...newContacts[ci], email: e.target.value };
                                                                                    updateLead(idx, { contacts: newContacts });
                                                                                }}
                                                                                className="h-6 text-[10px] px-2 bg-transparent border-white/10"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 text-sm">
                                                        {/* Company Info Section */}
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                            {/* REMOVED TRADE_NAME */}
                                                            {(lead.city || lead.uf) && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                                    <span>{lead.city}{lead.uf ? ` - ${lead.uf}` : ''}</span>
                                                                </div>
                                                            )}
                                                            {lead.address && (
                                                                <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                                                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="text-xs truncate">{lead.address}</span>
                                                                </div>
                                                            )}
                                                            {lead.website_url && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Globe className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="truncate">{lead.website_url}</span>
                                                                </div>
                                                            )}
                                                            {lead.instagram_url && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Instagram className="w-3.5 h-3.5 shrink-0" />
                                                                    <span>{lead.instagram_url}</span>
                                                                </div>
                                                            )}
                                                            {lead.source && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <FileText className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="text-xs">Fonte: <span className="text-white">{lead.source}</span></span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Notes */}
                                                        {lead.notes && (
                                                            <div className="flex items-start gap-2 text-amber-500/80 bg-amber-500/5 rounded-lg p-2">
                                                                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <span className="text-xs">{lead.notes}</span>
                                                            </div>
                                                        )}

                                                        {/* Contacts Section */}
                                                        {lead.contacts && lead.contacts.length > 0 && (
                                                            <div className="pt-2 border-t border-white/10">
                                                                <p className="text-[10px] uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                                                    <User className="w-3 h-3" />
                                                                    Contatos ({lead.contacts.length})
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {lead.contacts.map((c: any, cIdx: number) => (
                                                                        <div key={cIdx} className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs p-2 rounded-lg ${c.is_primary ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <User className={`w-3 h-3 ${c.is_primary ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                                                                                <span className="font-medium text-white">{c.name}</span>
                                                                                {c.is_primary && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Principal</span>}
                                                                            </div>
                                                                            {c.role && <span className="text-muted-foreground">• {c.role}</span>}
                                                                            {c.phone && <span className="text-blue-400">{c.phone}</span>}
                                                                            {c.email && <span className="text-purple-400">{c.email}</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end pt-2 border-t border-white/5 mt-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => saveAndRecheck(idx)}
                                                                className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-black font-medium gap-1"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Salvar e Validar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP: IMPORTING */}
                    {step === 'IMPORTING' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-20 h-20 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-lg animate-pulse">Importando {parsedLeads.length || fullData.length} leads...</p>
                        </div>
                    )}

                    {/* STEP: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Sucesso!</h3>

                            {/* Descriptive Message */}
                            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                                {(() => {
                                    if (importStats.imported === 0) return "Processo finalizado.";
                                    const distinctStages = new Set(parsedLeads.map(l => l.stage_id).filter(Boolean));
                                    const distinctOwners = new Set(parsedLeads.map(l => l.owner_id).filter(Boolean));

                                    let msg = `${importStats.imported} ${importStats.imported === 1 ? 'lead foi importado' : 'leads foram importados'}`;

                                    // Stage Info
                                    if (distinctStages.size === 1) {
                                        const col = columns.find(c => c.id === Array.from(distinctStages)[0]);
                                        if (col) msg += ` para a etapa <span class="text-white font-medium">${col.title}</span>`;
                                    } else if (distinctStages.size > 1) {
                                        msg += ` para etapas variadas`;
                                    }

                                    // Owner Info
                                    if (distinctOwners.size === 1) {
                                        const ownerId = Array.from(distinctOwners)[0];
                                        const u = availableUsers.find(users => users.id === ownerId);
                                        const name = u ? u.name : (profile && profile.id === ownerId ? (profile.name || 'Você') : 'Usuário');
                                        msg += ` e atribuídos a <span class="text-white font-medium">${name}</span>`;
                                    } else if (distinctOwners.size > 1) {
                                        msg += ` com atribuições variadas`;
                                    } else {
                                        msg += ` sem atribuição específica`;
                                    }

                                    return <span dangerouslySetInnerHTML={{ __html: msg + '.' }} />;
                                })()}
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-3xl font-bold text-white">{importStats.imported}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Importados</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-3xl font-bold text-rose-400">{importStats.errors}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Erros</p>
                                </div>
                            </div>

                            {importStats.errors > 0 && importStats.errorDetails && importStats.errorDetails.length > 0 && (
                                <div className="w-full max-w-md mt-4 text-left">
                                    <Label className="text-xs uppercase text-muted-foreground mb-2 block pl-1">Detalhes dos Erros</Label>
                                    <ScrollArea className="h-40 bg-[#181818] border border-rose-500/20 rounded-xl p-3">
                                        <div className="space-y-2">
                                            {importStats.errorDetails.map((err: any, i: number) => (
                                                <div key={i} className="text-xs flex items-start gap-2 text-rose-300 bg-rose-500/10 p-2 rounded">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <span className="font-bold text-rose-200 block mb-0.5">{err.name}</span>
                                                        <span className="opacity-90">{err.error}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            <Button className="mt-4 w-full max-w-sm" onClick={handleClose}>
                                Fechar e Ver Leads
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-white/10 pt-4">
                    {step === 'MAPPING' && (
                        <>
                            <Button variant="ghost" onClick={reset}>Voltar</Button>
                            <Button onClick={handleConfirmFileImport} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                Confirmar Importação <ChevronRight className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    {step === 'TEXT_REVIEW' && (
                        <>
                            <Button variant="ghost" onClick={reset}>Cancelar</Button>
                            <Button
                                onClick={handleConfirmTextImport}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                disabled={parsedLeads.length === 0}
                            >
                                Importar {parsedLeads.length} Leads <Check className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
