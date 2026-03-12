"use client"

import { Navbar } from "@/components/store/navbar"
import { LayoutDashboard, Rocket, Zap, Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function CombosPage() {
    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />

            <div className="pt-32 sm:pt-48 container mx-auto px-6 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto text-center space-y-12"
                >
                    <div className="inline-flex p-6 rounded-[32px] bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/10">
                        <Zap className="w-16 h-16 text-primary animate-pulse" />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                            Próximamente: <br />
                            <span className="text-gradient">Combos Pozu</span>
                        </h1>

                        <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Estamos diseñando las mejores combinaciones para que ahorres y disfrutes al máximo. 
                            Pronto podrás pedir tus menús completos con un solo click.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-12">
                        {[
                            { icon: Rocket, title: "Envío Prioritario", desc: "Los combos salen volando de cocina directamente a tu mesa." },
                            { icon: Heart, title: "Hechos con Amor", desc: "La combinación perfecta de sabores diseñada por expertos." },
                            { icon: LayoutDashboard, title: "Personalizables", desc: "Tú eliges el refresco y el acompañante de tu menú." }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="bg-white/5 border border-white/10 p-10 rounded-[32px] backdrop-blur-sm hover:bg-white/10 transition-all group"
                            >
                                <feature.icon className="w-10 h-10 text-primary mb-6 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-xl mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
