
import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InsightAlertProps {
    pace: number;
    quality: number;
    className?: string;
}

export const InsightAlert: React.FC<InsightAlertProps> = ({ pace, quality, className }) => {
    let type: 'success' | 'warning' | 'critical' | 'neutral' = 'neutral';
    let message = '';
    let icon = Info;

    // Logic based on Pace vs Quality matrix
    if (pace >= 70 && quality >= 5) { // Adjusted quality threshold for "real" low volume data
        type = 'success';
        message = 'Ritmo excelente e alta conversão. Mantenha o foco!';
        icon = CheckCircle;
    } else if (pace >= 70 && quality < 5) {
        type = 'warning';
        message = 'Alto esforço com baixa conversão — revisar abordagem.';
        icon = AlertCircle;
    } else if (pace < 50 && quality >= 5) {
        type = 'warning';
        message = 'Boa técnica, mas baixo volume. Acelere a prospecção!';
        icon = TrendingUp;
    } else if (pace < 50 && quality < 5) {
        type = 'critical';
        message = 'Ritmo e conversão baixos. Necessário coaching urgente.';
        icon = AlertCircle;
    } else {
        type = 'neutral';
        message = 'Aguardando mais dados para diagnóstico...';
    }

    const styles = {
        success: 'bg-neon-green/10 border-neon-green/30 text-neon-green-soft',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        critical: 'bg-red-500/10 border-red-500/30 text-red-400',
        neutral: 'bg-border-subtle/50 border-border-subtle text-text-muted',
    };

    const Icon = icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-full px-4 py-2 flex items-center justify-center gap-2 border",
                styles[type],
                className
            )}
        >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">{message}</span>
        </motion.div>
    );
};
