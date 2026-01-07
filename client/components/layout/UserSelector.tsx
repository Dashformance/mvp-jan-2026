import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSelectorProps {
    currentUser: string;
    onChange: (user: string) => void;
    onLogout?: () => void;
}

export function UserSelector({ currentUser, onChange, onLogout }: UserSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus:outline-none">
                <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                    <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-muted ring-1 ring-accent/50 shadow-[0_0_10px_rgba(0,0,0,0.2)]",
                        currentUser === 'joao' ? 'bg-cyan-500/20 ring-cyan-500/30' : 'bg-amber-500/20 ring-amber-500/30'
                    )}>
                        <span className="text-xs font-bold text-white">
                            {currentUser === 'joao' ? 'J' : 'VN'}
                        </span>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium text-white leading-none">
                            {currentUser === 'joao' ? 'João' : 'Vitor Nitz'}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {currentUser === 'joao' ? 'Admin' : 'Sócio'}
                            </span>
                            <ChevronDown className="w-3 h-3 text-white/30" />
                        </div>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#181818] border-white/10 text-white shadow-xl">
                <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider font-normal">Alternar Conta</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => onChange('joao')}
                    className="flex items-center justify-between cursor-pointer focus:bg-white/5 focus:text-white"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] border border-cyan-500/30">J</div>
                        <span>João</span>
                    </div>
                    {currentUser === 'joao' && <Check className="w-4 h-4 text-cyan-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onChange('vitor')}
                    className="flex items-center justify-between cursor-pointer focus:bg-white/5 focus:text-white"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] border border-amber-500/30">VN</div>
                        <span>Vitor Nitz</span>
                    </div>
                    {currentUser === 'vitor' && <Check className="w-4 h-4 text-amber-500" />}
                </DropdownMenuItem>

                {onLogout && (
                    <>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair da Conta
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
