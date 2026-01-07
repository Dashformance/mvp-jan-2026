import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateAdvancedScore } from "@/lib/services/lead-sanitizer";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, DollarSign, UserCheck, Briefcase, Zap, Building2, SearchCheck, Crown, ShieldAlert, MonitorPlay, BarChart2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Matches lead-sanitizer.ts
interface QualificationData {
    visualization: { usesRender: boolean, usesVideo360: boolean, usesSalesImg: boolean };
    maturity: { hasWebsite: boolean, hasLPs: boolean, hasDigitalMats: boolean };
    structure: { multipleProjects: boolean, teamVisible: boolean, institutionalComm: boolean };
    scale: { multipleCities: boolean, portfolioHistory: boolean, continuousComm: boolean };
    financial: { highStandardVisual: boolean, investBranding: boolean, activeAds: boolean };
    techOpenness: { interactiveLinks: boolean, digitalTools: boolean, cxFocus: boolean };
    absoluteStar?: boolean;
}

interface QualificationFormProps {
    data: Partial<QualificationData>;
    onChange: (data: Partial<QualificationData>) => void;
    leadData: any; // For calculating full score
}

export function QualificationForm({ data, onChange, leadData }: QualificationFormProps) {
    const [score, setScore] = useState(0);

    // Initial safe values
    const visualization = data.visualization || { usesRender: false, usesVideo360: false, usesSalesImg: false };
    const maturity = data.maturity || { hasWebsite: false, hasLPs: false, hasDigitalMats: false };
    const structure = data.structure || { multipleProjects: false, teamVisible: false, institutionalComm: false };
    const scale = data.scale || { multipleCities: false, portfolioHistory: false, continuousComm: false };
    const financial = data.financial || { highStandardVisual: false, investBranding: false, activeAds: false };
    const techOpenness = data.techOpenness || { interactiveLinks: false, digitalTools: false, cxFocus: false };

    useEffect(() => {
        const fullLeadData = {
            ...leadData,
            extra_info: {
                ...leadData.extra_info,
                qualification: data
            }
        };
        setScore(calculateAdvancedScore(fullLeadData));
    }, [data, leadData]);

    const updateLayer = (layer: keyof QualificationData, key: string, value: any) => {
        const currentLayer = data[layer] || {};
        // @ts-ignore
        const newLayer = { ...currentLayer, [key]: value };
        onChange({ ...data, [layer]: newLayer });
    };

    const getScoreColor = (s: number) => {
        if (s >= 85) return "text-emerald-400";
        if (s >= 70) return "text-cyan-400";
        if (s >= 55) return "text-amber-400";
        return "text-gray-400";
    };

    const getScoreLabel = (s: number) => {
        if (s >= 85) return "ICP Prioritário 🟢";
        if (s >= 70) return "ICP Compatível 🔵";
        if (s >= 55) return "Em Desenv. 🟡";
        return "Fora do ICP ⚪";
    };

    return (
        <div className="space-y-6">
            {/* Score Header */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className={cn("text-3xl font-bold", data.absoluteStar ? "text-amber-400" : getScoreColor(score))}>
                        {data.absoluteStar ? 100 : score}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">V-Score</span>
                        <span className={cn("text-sm font-medium", data.absoluteStar ? "text-amber-400" : getScoreColor(score))}>
                            {data.absoluteStar ? "Estrela Absoluta 🌟" : getScoreLabel(score)}
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full transition-all duration-300",
                        data.absoluteStar
                            ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 hover:text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                            : "text-muted-foreground hover:text-amber-400 hover:bg-amber-400/5"
                    )}
                    onClick={() => {
                        const newData = { ...data, absoluteStar: !data.absoluteStar };
                        onChange(newData);
                    }}
                >
                    <Star className={cn("w-6 h-6", data.absoluteStar && "fill-current")} />
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2" defaultValue="item-1">

                {/* 1. Uso comprovado de visualização (25 pts) */}
                <AccordionItem value="item-1" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <MonitorPlay className="w-4 h-4 text-purple-400" />
                            Visualização (Max 25 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="usesRender" checked={visualization.usesRender} onCheckedChange={(c) => updateLayer('visualization', 'usesRender', c)} />
                            <Label htmlFor="usesRender" className="text-sm font-normal text-muted-foreground">Usa Renders (Site/Insta) (+10)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="usesVideo360" checked={visualization.usesVideo360} onCheckedChange={(c) => updateLayer('visualization', 'usesVideo360', c)} />
                            <Label htmlFor="usesVideo360" className="text-sm font-normal text-muted-foreground">Usa Vídeo/Animação/360º (+8)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="usesSalesImg" checked={visualization.usesSalesImg} onCheckedChange={(c) => updateLayer('visualization', 'usesSalesImg', c)} />
                            <Label htmlFor="usesSalesImg" className="text-sm font-normal text-muted-foreground">Usa Imagem como Argumento (+7)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Maturidade Digital (20 pts) */}
                <AccordionItem value="item-2" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <SearchCheck className="w-4 h-4 text-emerald-400" />
                            Maturidade Digital (Max 20 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasWebsite"
                                checked={maturity.hasWebsite || !!leadData.website_url}
                                onCheckedChange={(c) => updateLayer('maturity', 'hasWebsite', c)}
                            />
                            <Label htmlFor="hasWebsite" className="text-sm font-normal text-muted-foreground">Site Próprio Ativo (+6)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="hasLPs" checked={maturity.hasLPs} onCheckedChange={(c) => updateLayer('maturity', 'hasLPs', c)} />
                            <Label htmlFor="hasLPs" className="text-sm font-normal text-muted-foreground">LPs por Empreendimento (+7)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="hasDigitalMats" checked={maturity.hasDigitalMats} onCheckedChange={(c) => updateLayer('maturity', 'hasDigitalMats', c)} />
                            <Label htmlFor="hasDigitalMats" className="text-sm font-normal text-muted-foreground">Materiais Digitais (PDF/Catálogo) (+7)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Estrutura Empresarial (15 pts) */}
                <AccordionItem value="item-3" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Estrutura (Max 15 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="multipleProjects" checked={structure.multipleProjects} onCheckedChange={(c) => updateLayer('structure', 'multipleProjects', c)} />
                            <Label htmlFor="multipleProjects" className="text-sm font-normal text-muted-foreground">Mais de 1 Empreendimento (+6)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="teamVisible" checked={structure.teamVisible} onCheckedChange={(c) => updateLayer('structure', 'teamVisible', c)} />
                            <Label htmlFor="teamVisible" className="text-sm font-normal text-muted-foreground">Time Visível (Mkt/Vendas) (+5)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="institutionalComm" checked={structure.institutionalComm} onCheckedChange={(c) => updateLayer('structure', 'institutionalComm', c)} />
                            <Label htmlFor="institutionalComm" className="text-sm font-normal text-muted-foreground">Comunicação Institucional (+4)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Escala (15 pts) */}
                <AccordionItem value="item-4" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <BarChart2 className="w-4 h-4 text-orange-400" />
                            Escala (Max 15 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="multipleCities" checked={scale.multipleCities} onCheckedChange={(c) => updateLayer('scale', 'multipleCities', c)} />
                            <Label htmlFor="multipleCities" className="text-sm font-normal text-muted-foreground">Atua em &gt;1 Cidade (+6)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="portfolioHistory" checked={scale.portfolioHistory} onCheckedChange={(c) => updateLayer('scale', 'portfolioHistory', c)} />
                            <Label htmlFor="portfolioHistory" className="text-sm font-normal text-muted-foreground">Histórico de Lançamentos (+5)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="continuousComm" checked={scale.continuousComm} onCheckedChange={(c) => updateLayer('scale', 'continuousComm', c)} />
                            <Label htmlFor="continuousComm" className="text-sm font-normal text-muted-foreground">Comunicação Contínua (+4)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 5. Capacidade Financeira (15 pts) */}
                <AccordionItem value="item-5" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            Financeiro (Max 15 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="highStandardVisual" checked={financial.highStandardVisual} onCheckedChange={(c) => updateLayer('financial', 'highStandardVisual', c)} />
                            <Label htmlFor="highStandardVisual" className="text-sm font-normal text-muted-foreground">Visual Alto Padrão (+6)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="investBranding" checked={financial.investBranding} onCheckedChange={(c) => updateLayer('financial', 'investBranding', c)} />
                            <Label htmlFor="investBranding" className="text-sm font-normal text-muted-foreground">Investe em Branding (+5)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="activeAds" checked={financial.activeAds} onCheckedChange={(c) => updateLayer('financial', 'activeAds', c)} />
                            <Label htmlFor="activeAds" className="text-sm font-normal text-muted-foreground">Anúncios Ativos (+4)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 6. Abertura Tecnologia (10 pts) */}
                <AccordionItem value="item-6" className="border border-white/5 rounded-lg bg-white/2 px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Tecnologia (Max 10 pts)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="interactiveLinks" checked={techOpenness.interactiveLinks} onCheckedChange={(c) => updateLayer('techOpenness', 'interactiveLinks', c)} />
                            <Label htmlFor="interactiveLinks" className="text-sm font-normal text-muted-foreground">Links/Hotsites Interativos (+4)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="digitalTools" checked={techOpenness.digitalTools} onCheckedChange={(c) => updateLayer('techOpenness', 'digitalTools', c)} />
                            <Label htmlFor="digitalTools" className="text-sm font-normal text-muted-foreground">Ferramentas Digitais (+3)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="cxFocus" checked={techOpenness.cxFocus} onCheckedChange={(c) => updateLayer('techOpenness', 'cxFocus', c)} />
                            <Label htmlFor="cxFocus" className="text-sm font-normal text-muted-foreground">Foco em Experiência (+3)</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}
