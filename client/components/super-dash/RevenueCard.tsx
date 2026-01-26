"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target } from "lucide-react";

/**
 * DS v2.0 Revenue Card
 * Exibe KPIs monetários: Vendas Realizadas e Dinheiro na Mesa
 */

interface RevenueCardProps {
    totalSold: number;      // Soma de contract_value onde status='SOLD' (WON)
    totalPipeline: number;  // Soma de contract_value onde status IN ('NEW','CONTACTED','MEETING','WON')
    className?: string;
}

export function RevenueCard({ totalSold, totalPipeline, className = "" }: RevenueCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            {/* Vendas Realizadas */}
            <Card className="bg-bg-elevated border-border-subtle hover:border-neon-green/30 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-neon-green-soft" />
                        Vendas Realizadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="font-display text-3xl font-bold text-neon-green-soft tracking-tight">
                        {formatCurrency(totalSold)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        Contratos fechados (WON)
                    </p>
                </CardContent>
            </Card>

            {/* Dinheiro na Mesa */}
            <Card className="bg-bg-elevated border-border-subtle hover:border-accent/30 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        Pipeline Ativo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="font-display text-3xl font-bold text-accent tracking-tight">
                        {formatCurrency(totalPipeline)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        Em negociação
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
