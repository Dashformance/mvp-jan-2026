"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { LogOut, User as UserIcon, BarChart3 } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
    const { user, profile, signOut } = useAuth()

    if (!user) return null

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase()
    }

    const isAdmin = profile?.role === 'admin'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-amber-500/20 ring-1 ring-amber-500/30 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                        <span className="text-xs font-bold text-white">
                            {getInitials(user.email || "User")}
                        </span>
                    </div>
                    <div className="flex flex-col items-start gap-0.5 hidden md:flex">
                        <span className="text-sm font-medium text-white leading-none">
                            {profile?.name || user.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {isAdmin ? 'Administrador' : 'Vendedor'}
                        </span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#181818] border-white/10 text-white shadow-xl">
                <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider font-normal">
                    Minha Conta
                </DropdownMenuLabel>

                <Link href="/super-dash">
                    <DropdownMenuItem className="cursor-pointer focus:bg-accent/10 focus:text-accent">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        SUPER DASH
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem className="text-sm opacity-70">
                    {user.email}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
