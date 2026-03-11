"use client"

import { Navbar } from "@/components/store/navbar"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"

export default function PedidosPage() {
    return (
        <div className="min-h-screen bg-[#111111] flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 container mx-auto">
                <div className="max-w-3xl w-full text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary neon-border mx-auto flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,184,0,0.3)]">
                        <ShoppingBag className="w-10 h-10 text-primary" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black uppercase text-[#E8E0D5] tracking-tight neon-text-glow">
                        Tu Pedido <br /> a un click
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Explora nuestra carta, elige tus hamburguesas favoritas y recíbelas calientes en la puerta de tu casa o recógelas en el local.
                    </p>

                    <div className="pt-8">
                        <Link href="/menu">
                            <button className="font-black text-2xl rounded-full neon-border text-primary px-12 py-4 hover:bg-primary hover:text-black transition-all uppercase tracking-wider neon-text-glow flex items-center gap-4 mx-auto group">
                                Iniciar Pedido
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
