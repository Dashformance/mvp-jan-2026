"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson";

const REGIONS = {
    "Norte": ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    "Nordeste": ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    "Centro-Oeste": ['DF', 'GO', 'MT', 'MS'],
    "Sudeste": ['ES', 'MG', 'RJ', 'SP'],
    "Sul": ['PR', 'RS', 'SC']
};

// [Longitude, Latitude]
const REGION_CENTERS: Record<string, [number, number]> = {
    "Norte": [-60.0, -5.0],
    "Nordeste": [-42.0, -10.0],
    "Centro-Oeste": [-54.0, -16.0],
    "Sudeste": [-45.0, -21.0],
    "Sul": [-52.0, -28.0]
};

const REGION_COLORS = {
    "Norte": "#10B981", // Emerald
    "Nordeste": "#F59E0B", // Amber
    "Centro-Oeste": "#3B82F6", // Blue
    "Sudeste": "#8B5CF6", // Violet
    "Sul": "#EC4899" // Pink
};

interface RegionDistributionProps {
    leads?: any[];
    data?: Record<string, number>;
}

export function RegionDistribution({ leads, data }: RegionDistributionProps) {
    const [tooltip, setTooltip] = useState<string | null>(null);

    // Calculate stats
    const stats = useMemo(() => {
        let counts: Record<string, number> = {
            "Norte": 0,
            "Nordeste": 0,
            "Centro-Oeste": 0,
            "Sudeste": 0,
            "Sul": 0,
            "Sem UF": 0
        };

        if (data) {
            counts = { ...counts, ...data };
        } else if (leads) {
            leads.forEach(lead => {
                const uf = lead.uf?.toUpperCase();
                if (!uf) {
                    counts["Sem UF"]++;
                    return;
                }
                let regionFound = false;
                for (const [region, ufs] of Object.entries(REGIONS)) {
                    if (ufs.includes(uf)) {
                        counts[region]++;
                        regionFound = true;
                        break;
                    }
                }
                if (!regionFound) counts["Sem UF"]++;
            });
        }
        return counts;
    }, [leads, data]);

    const maxCount = Math.max(...Object.values(stats));
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <Card
            className="border border-white/5 shadow-none h-full overflow-hidden flex flex-col"
            style={{
                background: 'radial-gradient(circle at center, rgba(222, 204, 168, 0.08) 0%, #1C1C1C 70%)'
            }}
        >
            <CardHeader className="pb-2 border-b border-white/5 z-10 shrink-0 bg-[#1C1C1C]/50 backdrop-blur-sm">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Distribuição Brasil
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col md:flex-row min-h-0 relative">

                {/* Map Section */}
                <div
                    className="flex-1 relative flex items-center justify-center overflow-hidden group perspective-1000"
                    style={{ perspective: '1000px' }}
                >
                    <div
                        className="w-full h-full transform transition-transform duration-500 hover:scale-105"
                        style={{ transform: 'rotateX(25deg) scale(0.9)' }}
                    >
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 650,
                                center: [-54, -15]
                            }}
                            style={{ width: "100%", height: "100%", filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                        >
                            <ZoomableGroup zoom={1} maxZoom={1}>
                                <Geographies geography={GEO_URL}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            const uf = geo.properties.sigla;
                                            // Determine region color
                                            let regionColor = "#2a2a2a";
                                            let isRegion = false;

                                            for (const [r, ufs] of Object.entries(REGIONS)) {
                                                if (ufs.includes(uf)) {
                                                    const c = stats[r];
                                                    if (c > 0) {
                                                        regionColor = REGION_COLORS[r as keyof typeof REGION_COLORS];
                                                        isRegion = true;
                                                    }
                                                    break;
                                                }
                                            }

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={isRegion ? regionColor + '40' : "#1f1f1f"} // Low opacity fill
                                                    stroke={isRegion ? regionColor : "#333"}
                                                    strokeWidth={1}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { fill: regionColor, transition: 'all 250ms' },
                                                        pressed: { outline: "none" },
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>

                                {/* 3D Pillars/Markers for Regions */}
                                {Object.entries(REGION_CENTERS).map(([region, coords]) => {
                                    const count = stats[region];
                                    const color = REGION_COLORS[region as keyof typeof REGION_COLORS];
                                    if (!count) return null;

                                    // Scale size
                                    const size = 10 + (count / (maxCount || 1)) * 30;

                                    return (
                                        <Marker key={region} coordinates={coords}>
                                            <g
                                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                                onMouseEnter={() => setTooltip(`${region}: ${count}`)}
                                                onMouseLeave={() => setTooltip(null)}
                                            >
                                                {/* Pillar Base */}
                                                <circle r={size / 2} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1} />

                                                {/* Pillar Body (Fake 3D - simple extruded circle effect using stacked circles or gradient) */}
                                                <circle r={5} fill={color} className="animate-pulse" />

                                                {/* Label */}
                                                <foreignObject x={-50} y={-size / 2 - 30} width={100} height={30}>
                                                    <div className="flex justify-center items-center">
                                                        <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded backdrop-blur-md">
                                                            {count}
                                                        </span>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        </Marker>
                                    )
                                })}
                            </ZoomableGroup>
                        </ComposableMap>
                    </div>

                    {/* Simple Tooltip Overlay */}
                    {tooltip && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border border-white/10 pointer-events-none animate-in fade-in zoom-in">
                            {tooltip}
                        </div>
                    )}
                </div>

                {/* Stats List */}
                <div className="w-full md:w-[280px] bg-[#1C1C1C] border-l border-white/5 overflow-y-auto custom-scrollbar p-6 space-y-6 shrink-0">
                    {/* Sem UF */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-amber-500 font-medium">Sem UF</span>
                            <span className="text-white font-mono">{stats["Sem UF"]}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-600 rounded-full"
                                style={{ width: `${(stats["Sem UF"] / (total || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Regions */}
                    {Object.entries(REGIONS).map(([region, ufs]) => {
                        const count = stats[region];
                        const percentage = (count / (total || 1)) * 100;
                        const color = REGION_COLORS[region as keyof typeof REGION_COLORS];

                        return (
                            <div key={region} className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">{region}</span>
                                    <span className="text-white font-mono">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: count > 0 ? color : 'transparent'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
