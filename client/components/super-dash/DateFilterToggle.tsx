"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";

export type DatePeriod = 'today' | 'week' | 'last-week' | 'month' | 'total' | 'custom';

interface DateFilterToggleProps {
    value: DatePeriod;
    onChange: (value: DatePeriod, range?: { from: Date; to: Date }) => void;
    currentRange?: { from: Date; to: Date };
    className?: string;
}

// Custom Calendar Component
function CustomRangeCalendar({
    selected,
    onSelect,
}: {
    selected?: { from?: Date; to?: Date };
    onSelect: (range: { from?: Date; to?: Date }) => void;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const allDays = eachDayOfInterval({ start, end });

        // Add padding for the first week
        const startDayOfWeek = getDay(start);
        const paddingBefore = Array(startDayOfWeek).fill(null);

        return [...paddingBefore, ...allDays];
    }, [currentMonth]);

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const handleDayClick = (day: Date) => {
        if (!selected?.from || (selected.from && selected.to)) {
            // Start new selection
            onSelect({ from: day, to: undefined });
        } else {
            // Complete selection
            if (day < selected.from) {
                onSelect({ from: day, to: selected.from });
            } else {
                onSelect({ from: selected.from, to: day });
            }
        }
    };

    const isStart = (day: Date) => selected?.from && isSameDay(day, selected.from);
    const isEnd = (day: Date) => selected?.to && isSameDay(day, selected.to);
    const isInRange = (day: Date) => {
        if (!selected?.from || !selected?.to) return false;
        return isWithinInterval(day, { start: selected.from, end: selected.to });
    };
    const isToday = (day: Date) => isSameDay(day, new Date());

    return (
        <div className="select-none">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-[10px] text-white/40 font-medium py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="w-9 h-9" />;
                    }

                    const isStartDay = isStart(day);
                    const isEndDay = isEnd(day);
                    const inRange = isInRange(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => handleDayClick(day)}
                            className={cn(
                                "w-9 h-9 text-sm font-medium transition-all duration-200 relative",
                                // Base styles
                                "text-white/80 hover:text-white",
                                // Today indicator
                                today && !isStartDay && !isEndDay && "ring-1 ring-accent/50 rounded-full",
                                // Range middle
                                inRange && !isStartDay && !isEndDay && "bg-white/10",
                                // Start day - GREEN
                                isStartDay && "bg-emerald-500 text-white rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10",
                                // End day - AMBER/ORANGE  
                                isEndDay && "bg-amber-500 text-black rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] z-10",
                                // Hover
                                !isStartDay && !isEndDay && "hover:bg-white/10 rounded-lg"
                            )}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DateFilterToggle({ value, onChange, currentRange, className }: DateFilterToggleProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [tempDate, setTempDate] = useState<{ from?: Date; to?: Date } | undefined>(
        currentRange ? { from: currentRange.from, to: currentRange.to } : undefined
    );

    const handleSelect = (period: DatePeriod) => {
        if (period === 'custom') {
            setIsCalendarOpen(true);
        } else {
            onChange(period);
        }
    };

    const handleRangeSelect = (range: { from?: Date; to?: Date }) => {
        setTempDate(range);
    };

    const applyCustomRange = () => {
        if (tempDate?.from && tempDate?.to) {
            onChange('custom', { from: tempDate.from, to: tempDate.to });
            setIsCalendarOpen(false);
        }
    };

    const options: { id: DatePeriod; label: string }[] = [
        { id: 'today', label: 'Hoje' },
        { id: 'week', label: 'Essa Semana' },
        { id: 'last-week', label: 'Semana Passada' },
        { id: 'month', label: 'Este Mês' },
        { id: 'total', label: 'Total' },
        { id: 'custom', label: 'Personalizado' },
    ];

    return (
        <div className={cn("inline-flex bg-bg-elevated p-1 rounded-xl border border-border-subtle shadow-sm", className)}>
            {options.map((option) => {
                const isActive = value === option.id;

                if (option.id === 'custom') {
                    return (
                        <Popover key={option.id} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={() => handleSelect(option.id)}
                                    className={cn(
                                        "relative px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 z-10",
                                        isActive ? "text-white" : "text-text-muted hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilter"
                                            className="absolute inset-0 bg-accent/20 border border-accent/30 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative flex items-center gap-2">
                                        {option.label}
                                        {isActive && value === 'custom' && currentRange && (
                                            <span className="text-[10px] opacity-70 ml-1">
                                                {format(currentRange.from, 'dd/MM', { locale: ptBR })} - {format(currentRange.to, 'dd/MM', { locale: ptBR })}
                                            </span>
                                        )}
                                        <Calendar className={cn("w-3 h-3", isActive ? "text-accent" : "opacity-50")} />
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10 shadow-2xl" align="end" sideOffset={8}>
                                <div className="p-5 min-w-[320px]">
                                    {/* Header mostrando período selecionado */}
                                    <div className="flex items-center justify-between gap-6 pb-4 mb-4 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <div>
                                                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Início</span>
                                                <span className="text-white font-bold text-sm">
                                                    {tempDate?.from ? format(tempDate.from, "dd MMM yyyy", { locale: ptBR }) : "Selecione"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-white/20 text-xl">→</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                            <div>
                                                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Fim</span>
                                                <span className="text-white font-bold text-sm">
                                                    {tempDate?.to ? format(tempDate.to, "dd MMM yyyy", { locale: ptBR }) : "Selecione"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Calendar */}
                                    <CustomRangeCalendar
                                        selected={tempDate}
                                        onSelect={handleRangeSelect}
                                    />

                                    {/* Legenda */}
                                    <div className="flex items-center justify-center gap-6 py-3 mt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <span className="text-[11px] text-white/50">Início</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-white/10" />
                                            <span className="text-[11px] text-white/50">Período</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <span className="text-[11px] text-white/50">Fim</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4 border-t border-white/10 mt-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setTempDate(undefined);
                                                setIsCalendarOpen(false);
                                            }}
                                            className="text-white/50 hover:text-white hover:bg-white/5"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={applyCustomRange}
                                            disabled={!tempDate?.from || !tempDate?.to}
                                            className="bg-accent text-black font-semibold hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Aplicar
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                }

                return (
                    <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={cn(
                            "relative px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300",
                            isActive ? "text-white" : "text-text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-accent/20 border border-accent/30 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
