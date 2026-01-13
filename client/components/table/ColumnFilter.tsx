"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface ColumnFilterProps {
    column: string;
    type: 'text' | 'select' | 'range';
    value?: any;
    onChange: (value: any) => void;
    options?: { label: string; value: string; color?: string }[];
    min?: number;
    max?: number;
}

export function ColumnFilter({ column, type, value, onChange, options, min, max }: ColumnFilterProps) {
    const [open, setOpen] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleApply = () => {
        onChange(tempValue);
        setOpen(false);
    };

    const handleClear = () => {
        setTempValue(undefined);
        onChange(undefined);
        setOpen(false);
    };

    // Sync temp value when opening
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) setTempValue(value);
        setOpen(isOpen);
    };

    const isActive = value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ml-1 hover:bg-white/10 ${isActive ? 'text-accent' : 'text-muted-foreground/50'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Filter className="w-3 h-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-3 bg-[#181818] border-white/10 text-white" align="start" onClick={e => e.stopPropagation()}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-xs text-muted-foreground uppercase">{column}</h4>
                        {isActive && (
                            <Button variant="ghost" size="sm" onClick={handleClear} className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-white">
                                Limpar
                            </Button>
                        )}
                    </div>

                    {type === 'text' && (
                        <Input
                            value={tempValue || ''}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder={`Filtrar ${column}...`}
                            className="h-8 bg-zinc-900 border-white/10 text-xs"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        />
                    )}

                    {type === 'select' && options && (
                        <div className="max-h-[200px] overflow-y-auto space-y-1.5 custom-scrollbar">
                            {options.map((opt) => (
                                <div key={opt.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`opt-${opt.value}`}
                                        checked={(tempValue || []).includes(opt.value)}
                                        onCheckedChange={(checked) => {
                                            const current = Array.isArray(tempValue) ? tempValue : [];
                                            if (checked) setTempValue([...current, opt.value]);
                                            else setTempValue(current.filter((v: string) => v !== opt.value));
                                        }}
                                        className="border-white/20 data-[state=checked]:bg-accent data-[state=checked]:text-black"
                                    />
                                    <Label htmlFor={`opt-${opt.value}`} className={`text-xs ${opt.color || 'text-zinc-400'}`}>
                                        {opt.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}

                    {type === 'range' && (
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={tempValue?.min || ''}
                                onChange={(e) => setTempValue({ ...(tempValue || {}), min: e.target.value ? Number(e.target.value) : undefined })}
                                className="h-8 bg-zinc-900 border-white/10 text-xs w-full"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={tempValue?.max || ''}
                                onChange={(e) => setTempValue({ ...(tempValue || {}), max: e.target.value ? Number(e.target.value) : undefined })}
                                className="h-8 bg-zinc-900 border-white/10 text-xs w-full"
                            />
                        </div>
                    )}

                    <Button size="sm" className="w-full h-7 text-xs bg-white text-black hover:bg-white/90" onClick={handleApply}>
                        Aplicar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
