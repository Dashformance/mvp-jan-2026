// ============================================
// DASHFORMANCE - Game Debug Panel
// Sprint 03: Superdash Logic RPG
// Componente para testes em desenvolvimento
// ============================================

'use client';

import { useState } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { ACTION_POINTS, getXPTable } from '@/lib/gamification';
import type { ActionType } from '@/lib/gamification';

/**
 * Painel de debug para testar o sistema de gamificação
 * APENAS EM DESENVOLVIMENTO
 */
export function GameDebugPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [lastResult, setLastResult] = useState<string>('');

    const {
        totalXP,
        level,
        levelTitle,
        levelInfo,
        combo,
        stats,
        unlockedBadges,
        nextBadges,
        badgeStats,
        addXP,
        resetGame,
        getDebugInfo,
    } = useGamification();

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const handleAddXP = (actionType: ActionType) => {
        const result = addXP(actionType);
        setLastResult(JSON.stringify(result, null, 2));
    };

    const handleReset = () => {
        if (confirm('Resetar todo o progresso do jogo?')) {
            resetGame();
            setLastResult('Game resetado!');
        }
    };

    const xpTable = getXPTable(10);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
            >
                🎮 Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">🎮 Game Debug Panel</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* Status Atual */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
                <h4 className="font-semibold mb-2">📊 Status</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-400">Nível:</span>
                        <span className="ml-2 font-bold text-yellow-400">
                            {level} - {levelTitle}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">XP Total:</span>
                        <span className="ml-2 font-bold text-green-400">{totalXP}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Combo:</span>
                        <span className="ml-2 font-bold text-orange-400">{combo}x</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Progresso:</span>
                        <span className="ml-2 font-bold text-blue-400">
                            {levelInfo.progress}%
                        </span>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${levelInfo.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        {levelInfo.xpToNextLevel} XP para o próximo nível
                    </p>
                </div>
            </div>

            {/* Ações de XP */}
            <div className="mb-4">
                <h4 className="font-semibold mb-2">⚡ Adicionar XP</h4>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(ACTION_POINTS) as ActionType[]).map((action) => (
                        <button
                            key={action}
                            onClick={() => handleAddXP(action)}
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                        >
                            {action.replace(/_/g, ' ')}
                            <span className="text-green-400 ml-1">+{ACTION_POINTS[action]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
                <h4 className="font-semibold mb-2">
                    🏆 Badges ({badgeStats.unlocked}/{badgeStats.total})
                </h4>
                <div className="flex flex-wrap gap-1">
                    {unlockedBadges.map((badge) => (
                        <span
                            key={badge.id}
                            className="text-xs bg-yellow-600 px-2 py-1 rounded"
                            title={badge.description}
                        >
                            {badge.name}
                        </span>
                    ))}
                    {unlockedBadges.length === 0 && (
                        <span className="text-xs text-gray-500">Nenhum badge ainda</span>
                    )}
                </div>
                {nextBadges.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-400">Próximos:</p>
                        {nextBadges.map(({ badge, progress }) => (
                            <div key={badge.id} className="text-xs text-gray-300 flex justify-between">
                                <span>{badge.name}</span>
                                <span className="text-blue-400">{Math.round(progress)}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
                <h4 className="font-semibold mb-2">📈 Stats</h4>
                <div className="text-xs grid grid-cols-2 gap-1">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key}>
                            <span className="text-gray-400">{key}:</span>
                            <span className="ml-1">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabela de XP */}
            <details className="mb-4">
                <summary className="cursor-pointer font-semibold mb-2">
                    📋 Tabela de XP por Nível
                </summary>
                <div className="text-xs bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
                    {xpTable.map((row) => (
                        <div
                            key={row.level}
                            className={`flex justify-between ${row.level === level ? 'text-yellow-400 font-bold' : ''}`}
                        >
                            <span>Nível {row.level}</span>
                            <span>{row.xpTotal} XP</span>
                        </div>
                    ))}
                </div>
            </details>

            {/* Último Resultado */}
            {lastResult && (
                <details className="mb-4">
                    <summary className="cursor-pointer font-semibold mb-2">
                        📝 Último Resultado
                    </summary>
                    <pre className="text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                        {lastResult}
                    </pre>
                </details>
            )}

            {/* Ações */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        if (getDebugInfo) {
                            console.log('Game Debug Info:', getDebugInfo());
                            setLastResult('Veja o console para debug info completa');
                        }
                    }}
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                >
                    Log no Console
                </button>
                <button
                    onClick={handleReset}
                    className="flex-1 text-xs bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition-colors"
                >
                    Resetar Tudo
                </button>
            </div>
        </div>
    );
}
