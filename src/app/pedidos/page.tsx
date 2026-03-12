"use client"

import { Navbar } from "@/components/store/navbar"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function PedidosPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales de Fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10 animate-pulse" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

            <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 container mx-auto relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl w-full text-center space-y-12"
                >
                    <div className="w-28 h-28 rounded-[32px] bg-primary/10 border-2 border-primary mx-auto flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,184,0,0.2)] rotate-12 hover:rotate-0 transition-transform duration-500">
                        <ShoppingBag className="w-12 h-12 text-primary" />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none italic">
                            Tu Pedido <br />
                            <span className="text-gradient">A un Click</span>
                        </h1>

                        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Explora nuestra carta, elige tus hamburguesas favoritas y recíbelas calientes en la puerta de tu casa o recógelas en el local.
                        </p>
                    </div>

                    <div className="pt-12">
                        <Link href="/menu">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="font-black text-3xl rounded-[32px] bg-primary text-black px-16 py-8 shadow-[0_0_40px_rgba(255,184,0,0.4)] hover:shadow-[0_0_60px_rgba(255,184,0,0.6)] transition-all uppercase tracking-tighter flex items-center gap-6 mx-auto group"
                            >
                                Iniciar Pedido
                                <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
