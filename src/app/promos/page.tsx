"use client"

import { Navbar } from "@/components/store/navbar"
import { Zap, Percent, Gift } from "lucide-react"
import Link from "next/link"

export default function PromosPage() {
    return (
        <div className="min-h-screen bg-[#111111] flex flex-col font-sans pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-6 max-w-6xl">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-[#E8E0D5] neon-text-glow">
                        Promos <span className="text-primary">Brutales</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Aprovecha nuestras combinaciones explosivas. Más sabor, menos precio.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Promo 1 */}
                    <div className="bg-[#1A1A1A] border-2 border-white/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl hover:border-primary transition-colors hover:shadow-[0_0_30px_rgba(255,184,0,0.2)] group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Combo Pareja</h3>
                        <p className="text-muted-foreground mb-6 flex-1">
                            2 Burgers Legendarias + 1 Ración de Patatas + 2 Bebidas
                        </p>
                        <div className="text-3xl font-black text-primary mb-6 neon-text-glow">24,90€</div>
                        <Link href="/menu">
                            <button className="text-primary w-full neon-border text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-primary hover:text-black transition-colors neon-text-glow">
                                Pedir Combo
                            </button>
                        </Link>
                    </div>

                    {/* Promo 2 */}
                    <div className="bg-[#1A1A1A] border-2 border-primary neon-border rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_30px_rgba(255,184,0,0.15)] relative md:transform md:-translate-y-4">
                        <div className="absolute -top-4 bg-primary text-black font-black uppercase text-xs px-4 py-1.5 rounded-full tracking-wider">
                            Más Vendido
                        </div>
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                            <Percent className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Día de Locos</h3>
                        <p className="text-muted-foreground mb-6 flex-1">
                            Todos los miércoles, tu segunda hamburguesa a mitad de precio.
                        </p>
                        <div className="text-3xl font-black text-primary mb-6 neon-text-glow">-50% OFF</div>
                        <Link href="/menu">
                            <button className="bg-primary text-black w-full neon-border text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-transparent hover:text-primary transition-colors neon-text-glow">
                                Aprovechar
                            </button>
                        </Link>
                    </div>

                    {/* Promo 3 */}
                    <div className="bg-[#1A1A1A] border-2 border-white/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl hover:border-primary transition-colors hover:shadow-[0_0_30px_rgba(255,184,0,0.2)] group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Gift className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Combo Fiesta</h3>
                        <p className="text-muted-foreground mb-6 flex-1">
                            4 Burgers Clásicas + 2 Sides Gigantes + 4 Bebidas + Postre
                        </p>
                        <div className="text-3xl font-black text-primary mb-6 neon-text-glow">49,50€</div>
                        <Link href="/menu">
                            <button className="text-primary w-full neon-border text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-primary hover:text-black transition-colors neon-text-glow">
                                Pedir Combo
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
