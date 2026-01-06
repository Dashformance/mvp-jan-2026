import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

interface UserSelectorProps {
    currentUser: string;
    onChange: (user: string) => void;
}

export function UserSelector({ currentUser, onChange }: UserSelectorProps) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-muted ring-1 ring-accent/50`}>
                <span className="text-xs font-medium text-white">
                    {currentUser === 'joao' ? 'J' : 'VN'}
                </span>
            </div>

            <Select value={currentUser} onValueChange={onChange}>
                <SelectTrigger className="h-9 bg-[#222222] border border-white/10 rounded-full shadow-sm px-4 gap-2 focus:ring-0 text-white font-medium hover:bg-[#2A2A2A] text-sm transition-all focus:ring-offset-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="joao">João</SelectItem>
                    <SelectItem value="vitor">Vitor Nitz</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
