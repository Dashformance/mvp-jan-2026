"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Loader2, Lock, Mail, ArrowRight, Zap } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * DS v2.0 Login Page
 * - Background: bg-bg-base (#0A0A0A)
 * - Card: bg-bg-elevated (#222222)
 * - Accent: Champagne (#DECCA8)
 */

export default function LoginPage() {
    const { signInWithEmail } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(true)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await signInWithEmail(email, password)
            if (error) {
                toast.error("Erro ao entrar", {
                    description: "Verifique suas credenciais e tente novamente."
                })
            } else {
                toast.success("Login realizado com sucesso!")
            }
        } catch (err) {
            toast.error("Erro inesperado", {
                description: "Tente novamente mais tarde."
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-base p-4 relative overflow-hidden">
            {/* Background Gradients - DS v2.0 */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Decorative grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 mb-6 shadow-[0_0_40px_rgba(222,204,168,0.3)]"
                    >
                        <Zap className="w-8 h-8 text-accent" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Dashformance
                    </h1>
                    <p className="text-text-muted text-sm">
                        Plataforma de Aceleração Comercial B2B
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-bg-elevated border border-border-subtle p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white mb-1">Bem-vindo de volta</h2>
                        <p className="text-text-muted text-sm">
                            Entre com suas credenciais para acessar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-primary border border-border-default rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-disabled"
                                    placeholder="nome@exemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Senha</label>
                                <a href="#" className="text-xs text-accent hover:text-accent-light transition-colors">Esqueceu a senha?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-bg-primary border border-border-default rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-disabled"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Lembrar de mim */}
                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked === true)}
                                className="border-border-default data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                            />
                            <label
                                htmlFor="remember"
                                className="text-sm text-text-muted cursor-pointer select-none"
                            >
                                Lembrar de mim
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-light text-bg-void font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-[0_0_20px_rgba(222,204,168,0.3)] hover:shadow-[0_0_30px_rgba(222,204,168,0.5)]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border-subtle text-center">
                        <p className="text-xs text-text-muted">
                            Não tem uma conta?{" "}
                            <span className="text-accent hover:underline cursor-pointer">Contate o administrador</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-text-disabled mt-6 uppercase tracking-widest">
                    © 2026 Dashformance • Todos os direitos reservados
                </p>
            </motion.div>
        </div>
    )
}
