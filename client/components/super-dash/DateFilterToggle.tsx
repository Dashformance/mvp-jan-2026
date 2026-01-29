"use client";

import { motion } from "framer-motion";
import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export type DatePeriod = 'today' | '7d' | '15d' | 'total' | 'custom';

interface DateFilterToggleProps {
    value: DatePeriod;
    onChange: (value: DatePeriod, range?: { from: Date; to: Date }) => void;
    currentRange?: { from: Date; to: Date };
    className?: string; // Allow custom classNames
}

export function DateFilterToggle({ value, onChange, currentRange, className }: DateFilterToggleProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [tempDate, setTempDate] = useState<{ from: Date; to?: Date } | undefined>(
        currentRange ? { from: currentRange.from, to: currentRange.to } : undefined
    );

    const handleSelect = (period: DatePeriod) => {
        if (period === 'custom') {
            setIsCalendarOpen(true);
        } else {
            onChange(period);
        }
    };

    const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
        setTempDate(range ? { from: range.from!, to: range.to } : undefined);
    };

    const applyCustomRange = () => {
        if (tempDate?.from && tempDate?.to) {
            onChange('custom', { from: tempDate.from, to: tempDate.to });
            setIsCalendarOpen(false);
        }
    };

    const options: { id: DatePeriod; label: string }[] = [
        { id: 'today', label: 'Hoje' },
        { id: '7d', label: '7 Dias' },
        { id: '15d', label: '15 Dias' },
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
                            <PopoverContent className="w-[320px] p-0 bg-bg-elevated border-border-subtle" align="end">
                                <div className="p-3 flex justify-center">
                                    <CalendarComponent
                                        mode="range"
                                        selected={tempDate}
                                        onSelect={handleRangeSelect as any}
                                        initialFocus
                                        numberOfMonths={1}
                                        locale={ptBR}
                                        className="bg-bg-elevated text-text-primary rounded-md border border-border-subtle"
                                        classNames={{
                                            day_selected: "bg-accent text-bg-deep hover:bg-accent hover:text-bg-deep focus:bg-accent focus:text-bg-deep",
                                            day_today: "bg-white/5 text-accent",
                                            day_range_middle: "aria-selected:bg-accent/20 aria-selected:text-white"
                                        }}
                                    />
                                    <div className="mt-2 flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsCalendarOpen(false)}
                                            className="text-text-muted hover:text-white"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={applyCustomRange}
                                            disabled={!tempDate?.from || !tempDate?.to}
                                            className="bg-accent text-bg-deep hover:bg-accent/90"
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
