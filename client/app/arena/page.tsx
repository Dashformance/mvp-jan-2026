'use client';

import { useEffect, useState } from 'react';
import { PlayerCard, type PlayerCardProps } from '@/components/super-dash/PlayerCard';

interface PlayerData extends PlayerCardProps {
    id: string;
}

export default function ArenaPage() {
    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/gamification/scores')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setPlayers(data);
                } else {
                    console.error("Data is not an array:", data);
                    setPlayers([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading arena stats:", err);
                setPlayers([]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2 font-['Space_Grotesk']">
                    🏟️ Arena do Time
                </h1>
                <p className="text-gray-400 mb-8 font-mono text-sm">
                    Performance dos vendedores em tempo real
                </p>

                <div className="flex flex-wrap gap-8 justify-center">
                    {players.map((player) => (
                        <PlayerCard
                            key={player.id}
                            {...player}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
