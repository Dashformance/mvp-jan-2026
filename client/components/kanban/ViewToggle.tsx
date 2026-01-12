import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
    view: 'list' | 'kanban';
    onViewChange: (view: 'list' | 'kanban') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex bg-[#181818] p-1 rounded-lg border border-white/5">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('kanban')}
                className={`h-8 px-3 gap-2 transition-all ${view === 'kanban'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
            >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs font-medium">Kanban</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('list')}
                className={`h-8 px-3 gap-2 transition-all ${view === 'list'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
            >
                <Table2 className="w-4 h-4" />
                <span className="text-xs font-medium">Lista</span>
            </Button>
        </div>
    );
}
