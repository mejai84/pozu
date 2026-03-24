"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function AuthForm() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isPasswordLogin, setIsPasswordLogin] = useState(false)
    const [showForgot, setShowForgot] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isPasswordLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage({
                    type: 'success',
                    text: '¡Enlace enviado! Revisa tu correo electrónico para iniciar sesión.'
                })
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Ocurrió un error al intentar ingresar.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setMessage({ type: 'error', text: 'Escribe tu email primero.' })
            return
        }
        setLoading(true)
        setMessage(null)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
            })
            if (error) throw error
            setMessage({ type: 'success', text: '¡Email enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.' })
            setShowForgot(false)
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al enviar el email de recuperación.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                <button
                    onClick={() => { setIsPasswordLogin(false); setShowForgot(false); setMessage(null) }}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                        !isPasswordLogin ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Email Mágico
                </button>
                <button
                    onClick={() => { setIsPasswordLogin(true); setShowForgot(false); setMessage(null) }}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                        isPasswordLogin ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Contraseña
                </button>
            </div>

            {showForgot ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Introduce tu email y te enviamos un enlace para restablecer tu contraseña.
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full h-11 pl-10 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full h-11 font-bold text-base" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : "Enviar enlace de recuperación"}
                    </Button>
                    <button type="button" onClick={() => setShowForgot(false)} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors">
                        ← Volver al login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full h-11 pl-10 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {isPasswordLogin && (
                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Tu contraseña"
                                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => { setShowForgot(true); setMessage(null) }}
                                    className="text-xs text-primary hover:underline transition-all"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 font-bold text-base"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ingresando...</>
                        ) : (
                            isPasswordLogin ? "Entrar" : "Continuar con Email"
                        )}
                    </Button>
                </form>
            )}

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="text-center text-xs text-muted-foreground">
                ¿Olvidaste tu contraseña? Usa el Email Mágico para entrar directamente.
            </div>
        </div>
    )
}
