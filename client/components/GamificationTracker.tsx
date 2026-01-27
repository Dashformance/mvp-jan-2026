import { useEffect, useRef, useState } from "react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/context/auth-context";
import { LevelUpModal } from "@/components/super-dash/LevelUpModal";

/**
 * Componente invisível para inicializar e rastrear a gamificação globalmente
 * Garante que o Login Diário e Streaks sejam contados mesmo sem interagir com UI
 * Também gerencia notificações globais como Level Up
 */
export function GamificationTracker() {
    // Apenas instanciar o hook já dispara os efeitos de inicialização (recordLogin)
    const { level } = useGamification();
    const { profile } = useAuth();

    const [showLevelUp, setShowLevelUp] = useState(false);
    const prevLevelRef = useRef(level);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Ignora a primeira renderização/inicialização
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            prevLevelRef.current = level;
            return;
        }

        // Se o nível aumentou
        if (level > prevLevelRef.current) {
            setShowLevelUp(true);
        }

        // Atualiza ref
        prevLevelRef.current = level;

    }, [level]);

    return (
        <>
            <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                level={level}
                userName={profile?.name || 'Jogador'}
                avatar={(profile as any)?.avatar_url || '😎'}
            />
        </>
    );
}
