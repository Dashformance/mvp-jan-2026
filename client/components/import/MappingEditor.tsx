"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface MappingEditorProps {
    fileHeaders: string[];
    mapping: Record<string, string>;
    onMappingChange: (newMapping: Record<string, string>) => void;
}

const SYSTEM_FIELDS = [
    { value: 'company_name', label: 'Razão Social', required: false }, // User requested flexibility
    { value: 'trade_name', label: 'Nome Fantasia', required: false },
    { value: 'cnpj', label: 'CNPJ', required: false },
    { value: 'decision_maker', label: 'Responsável/Decisor', required: false }, // Updated label
    { value: 'phone', label: 'Telefone/WhatsApp', required: false },
    { value: 'email', label: 'Email', required: false },
    { value: 'city', label: 'Cidade', required: false },
    { value: 'uf', label: 'UF', required: false },
    { value: 'notes', label: 'Observações/Extras', required: false },
];

export function MappingEditor({ fileHeaders, mapping, onMappingChange }: MappingEditorProps) {
    const [localMapping, setLocalMapping] = useState(mapping);

    // Sync prop changes
    useEffect(() => {
        setLocalMapping(mapping);
    }, [mapping]);

    const handleSelectChange = (sysField: string, header: string) => {
        const next = { ...localMapping };
        if (header === "_ignore") {
            delete next[sysField];
        } else {
            next[sysField] = header;
        }
        setLocalMapping(next);
        onMappingChange(next);
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-medium text-amber-500 mb-1">Verifique o mapeamento das colunas</p>
                    <p className="text-amber-500/80">A inteligência artificial sugeriu as conexões abaixo. Confirme se as colunas do seu arquivo (esquerda) correspondem aos campos do sistema (direita).</p>
                </div>
            </div>

            <div className="space-y-4">
                {SYSTEM_FIELDS.map((field) => (
                    <div key={field.value} className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                        {/* Target (CRM Field) */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${field.required ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {/* Icon placeholder or initials */}
                                    <span className="text-xs font-bold">{field.label.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <Label className="text-sm font-medium text-white">
                                    {field.label}
                                </Label>
                            </div>
                            <div className="flex items-center gap-1.5 ml-10">
                                <span className="text-[10px] text-muted-foreground font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                                    {field.value}
                                </span>
                                {field.required && <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Obrigatório</span>}
                            </div>
                        </div>

                        {/* Connector Arrow */}
                        <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recebe de</span>
                            <ArrowRight className="w-5 h-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                        </div>

                        {/* Source (File Header) */}
                        <div className="relative">
                            <Label className="absolute -top-2.5 left-2 bg-[#181818] px-1 text-[10px] text-muted-foreground z-10">
                                Coluna na Planilha
                            </Label>
                            <Select
                                value={localMapping[field.value] || "_ignore"}
                                onValueChange={(val) => handleSelectChange(field.value, val)}
                            >
                                <SelectTrigger className="w-full bg-black/40 border-white/10 text-white h-11 focus:ring-emerald-500/20 focus:border-emerald-500/50">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#181818] border-white/10 text-white">
                                    <SelectItem value="_ignore" className="text-muted-foreground italic">
                                        🚫 Não importar (Vazio)
                                    </SelectItem>
                                    {fileHeaders.map((header) => (
                                        <SelectItem key={header} value={header} className="cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {header}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
