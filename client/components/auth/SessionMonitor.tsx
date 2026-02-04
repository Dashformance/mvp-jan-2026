"use client"

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * SessionMonitor - Monitora a expiração da sessão e avisa o usuário
 * antes do token expirar, permitindo renovação sem perder estado.
 */
export function SessionMonitor() {
    const { session } = useAuth();
    const router = useRouter();
    const [hasWarned, setHasWarned] = useState(false);

    useEffect(() => {
        if (!session?.expires_at) return;

        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();

        // Se já expirou ou vai expirar em menos de 1 minuto
        if (timeUntilExpiry < 60 * 1000) {
            console.warn('⚠️ Sessão expirada ou prestes a expirar');
            return;
        }

        // Mostrar aviso 5 minutos antes de expirar
        const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

        const warningTimeout = setTimeout(() => {
            if (!hasWarned) {
                toast.warning('Sua sessão expirará em breve', {
                    description: 'Clique para renovar e continuar trabalhando',
                    duration: 30000, // 30s
                    action: {
                        label: 'Renovar',
                        onClick: () => {
                            window.location.reload();
                        }
                    }
                });
                setHasWarned(true);
            }
        }, warningTime);

        return () => {
            clearTimeout(warningTimeout);
        };
    }, [session, hasWarned]);

    return null;
}
