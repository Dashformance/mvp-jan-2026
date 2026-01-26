interface StatItemProps {
    label: string;
    value: number | string;
    color: 'cyan' | 'green' | 'yellow' | 'muted';
    align?: 'left' | 'right';
}

const colorMap = {
    cyan: '#00D4FF',
    green: '#00FF88',
    yellow: '#FFE066',
    muted: '#555555',
};

export function StatItem({ label, value, color, align = 'left' }: StatItemProps) {
    return (
        <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`}>
            <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-text-muted">
                {label}
            </span>
            <span
                className="font-display text-4xl font-bold"
                style={{ color: colorMap[color] }}
            >
                {value}
            </span>
        </div>
    );
}

export function SideStats({
    stats,
    align
}: {
    stats: StatItemProps[];
    align: 'left' | 'right';
}) {
    return (
        <div className="flex flex-col gap-8">
            {stats.map((stat, i) => (
                <StatItem key={i} {...stat} align={align} />
            ))}
        </div>
    );
}
