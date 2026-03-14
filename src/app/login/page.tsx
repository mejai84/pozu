"use client"

import { AuthForm } from "@/components/auth/auth-form"
import Link from "next/link"
import { Navbar } from "@/components/store/navbar"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-background relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />

            <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-20 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center gap-8 shadow-2xl shadow-black/50"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-black uppercase text-primary border border-primary/20">
                            <Sparkles className="w-3 h-3" /> Rock & Burgers
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                            Bienvenido al <br />
                            <span className="text-gradient">Pozu 2.0</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-center">
                            Identifícate para quemar el asfalto y disfrutar de tus ventajas.
                        </p>
                    </div>

                    <AuthForm />

                    <div className="pt-6 border-t border-white/5 w-full text-center space-y-4">
                        <Link href="/menu" className="block text-primary font-bold hover:underline transition-all">
                            Continuar a la carta sin registrarse
                        </Link>
                        
                        <Link href="/admin" className="block text-[10px] text-muted-foreground hover:text-primary uppercase tracking-[0.2em] font-black transition-colors pt-4 border-t border-white/5 mx-10">
                            Acceso Empleados / Admin
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
