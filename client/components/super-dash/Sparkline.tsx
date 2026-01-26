import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
    data: any[];
    dataKey?: string;
    color?: string;
    className?: string;
}

export function Sparkline({ data, dataKey, color = "#DECCA8", className }: SparklineProps) {
    // Transform data into format expected by Recharts
    const chartData = data.map((val, i) => {
        if (typeof val === 'number') return { i, val };
        if (dataKey && typeof val === 'object' && val !== null) return { i, val: val[dataKey] };
        return { i, val: 0 };
    });

    return (
        <div className={cn("h-12 w-24", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`sparkGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#sparkGradient-${color.replace('#', '')})`}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
