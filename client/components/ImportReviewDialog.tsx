import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useState, useEffect } from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";

interface LeadCandidate {
    company_name: string;
    trade_name: string;
    cnpj: string;
    phone: string | null;
    email: string | null;
    status: string;
    notes?: string;
}

interface ImportReviewDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidates: LeadCandidate[];
    onConfirm: (selectedLeads: LeadCandidate[]) => void;
    onCancel: () => void;
    isSaving: boolean;
    onCandidatesChange?: (candidates: LeadCandidate[]) => void;
}

export function ImportReviewDialog({
    isOpen,
    onOpenChange,
    candidates,
    onConfirm,
    onCancel,
    isSaving,
    onCandidatesChange
}: ImportReviewDialogProps) {
    const [selectedCnpjs, setSelectedCnpjs] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && candidates.length > 0) {
            // Select all by default
            setSelectedCnpjs(new Set(candidates.map(c => c.cnpj)));
        }
    }, [isOpen, candidates]);

    const toggleLead = (cnpj: string) => {
        const newSet = new Set(selectedCnpjs);
        if (newSet.has(cnpj)) {
            newSet.delete(cnpj);
        } else {
            newSet.add(cnpj);
        }
        setSelectedCnpjs(newSet);
    };

    const toggleAll = () => {
        if (selectedCnpjs.size === candidates.length) {
            setSelectedCnpjs(new Set());
        } else {
            setSelectedCnpjs(new Set(candidates.map(c => c.cnpj)));
        }
    };

    const handleConfirm = () => {
        const selected = candidates.filter(c => selectedCnpjs.has(c.cnpj));
        onConfirm(selected);
    };

    const removeDuplicates = () => {
        if (!onCandidatesChange) return;

        const unique = new Map();
        candidates.forEach(c => {
            const root = c.cnpj.substring(0, 8);
            if (!unique.has(root)) {
                unique.set(root, c);
            }
        });

        if (unique.size < candidates.length) {
            const newCandidates = Array.from(unique.values());
            onCandidatesChange(newCandidates);

            // Reselect all available ensures checking new list
            setSelectedCnpjs(new Set(newCandidates.map(c => c.cnpj)));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-[#141414] border-white/10 text-white p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b border-white/10">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Revisão de Importação
                        <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                            {candidates.length} encontrados
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Revise os leads encontrados antes de salvar no banco de dados.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="select-all"
                                checked={selectedCnpjs.size === candidates.length && candidates.length > 0}
                                onCheckedChange={toggleAll}
                                className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                                Selecionar Tudo ({selectedCnpjs.size})
                            </label>
                        </div>
                        {onCandidatesChange && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={removeDuplicates}
                                className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                                title="Mantém apenas um lead por empresa (Raiz CNPJ)"
                            >
                                Remover Duplicatas
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 p-1">
                        <div className="divide-y divide-white/5">
                            {candidates.map((lead) => (
                                <div
                                    key={lead.cnpj}
                                    className={`flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors ${!selectedCnpjs.has(lead.cnpj) ? 'opacity-50' : ''}`}
                                    onClick={() => toggleLead(lead.cnpj)}
                                >
                                    <Checkbox
                                        checked={selectedCnpjs.has(lead.cnpj)}
                                        onCheckedChange={() => toggleLead(lead.cnpj)}
                                        className="mt-1 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                    <div className="flex-1 cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-white/90">{lead.company_name}</h4>
                                            <span className="text-xs font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{lead.cnpj}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="opacity-70">Fantasia:</span>
                                                <span className="text-white/70">{lead.trade_name || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="opacity-70">Tel:</span>
                                                <span className={`${lead.phone ? 'text-emerald-400' : 'text-gray-600'}`}>{lead.phone || 'Sem telefone'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 col-span-2">
                                                <span className="opacity-70">Email:</span>
                                                <span className={`${lead.email ? 'text-blue-400' : 'text-gray-600'} truncate`}>{lead.email || 'Sem email'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-white/10 bg-[#181818]">
                    <div className="flex items-center gap-4 w-full justify-between">
                        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={selectedCnpjs.size === 0 || isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando Leads...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Importar {selectedCnpjs.size} Leads
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
