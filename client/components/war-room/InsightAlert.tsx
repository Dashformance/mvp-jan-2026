'use client';

import { motion } from 'framer-motion';

type AlertType = 'critical' | 'warning' | 'success' | 'info';

interface InsightAlertProps {
    type: AlertType;
    message: string;
    icon?: string;
}

const alertStyles = {
    critical: {
        bg: 'rgba(255, 71, 87, 0.1)',
        border: 'rgba(255, 71, 87, 0.3)',
        icon: '⚠️',
    },
    warning: {
        bg: 'rgba(255, 224, 102, 0.1)',
        border: 'rgba(255, 224, 102, 0.3)',
        icon: '💡',
    },
    success: {
        bg: 'rgba(0, 255, 136, 0.1)',
        border: 'rgba(0, 255, 136, 0.3)',
        icon: '🔥',
    },
    info: {
        bg: 'rgba(222, 204, 168, 0.1)',
        border: 'rgba(222, 204, 168, 0.3)',
        icon: '💡',
    },
};

export function InsightAlert({ type, message, icon }: InsightAlertProps) {
    const styles = alertStyles[type];

    return (
        <motion.div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap"
            style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <span>{icon || styles.icon}</span>
            <span className="text-sm font-medium text-white">{message}</span>
        </motion.div>
    );
}
