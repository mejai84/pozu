"use client"

import { Navbar } from "@/components/store/navbar"
import Image from "next/image"
import { Star, ShieldCheck, Heart, MapPin, Award, Users, Utensils } from "lucide-react"
import { motion } from "framer-motion"

export default function NosotrosPage() {
    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />

            {/* Hero Section */}
            <section className="pt-32 sm:pt-48 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                            <Award className="w-4 h-4" />
                            Nuestra Historia
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                            Más que una <br />
                            <span className="text-gradient">Hamburguesería</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                            Nacimos en el corazón de Pola de Laviana con una misión clara: elevar el concepto de la hamburguesa artesanal usando el mejor producto de nuestra tierra Asturiana.
                        </p>

                        <div className="grid grid-cols-2 gap-12 pt-8">
                            <div className="space-y-2">
                                <div className="text-5xl font-black text-primary tracking-tighter">+10k</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Clientes
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-5xl font-black text-primary tracking-tighter">100%</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <Utensils className="w-4 h-4" /> Calidad
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl shadow-primary/5"
                    >
                        <Image
                            src="/images/logo.jpg"
                            alt="Interior del local"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 p-8 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-xl font-medium italic leading-relaxed">
                                "El sabor del Pozu no se explica con palabras, se siente en cada mordisco de pura ternera."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-white/[0.02] -skew-y-3 pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                                title: "Calidad Suprema",
                                desc: "Seleccionamos personalmente cada ingrediente. Nuestra carne nunca ha sido congelada y nuestro pan se hornea a diario."
                            },
                            {
                                icon: <Heart className="w-10 h-10 text-primary" />,
                                title: "Hecho a Mano",
                                desc: "Aquí no hay máquinas procesadoras. Cada hamburguesa es boleada y aplastada a mano para mantener su jugosidad."
                            },
                            {
                                icon: <Star className="w-10 h-10 text-primary" />,
                                title: "Esencia Rockera",
                                desc: "Somos Pozu por la mina y por el espíritu. Un ambiente joven, dinámico y con la mejor música de fondo."
                            }
                        ].map((val, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-10 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group cursor-default"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {val.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{val.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {val.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Section Redirect */}
            <section className="py-24">
                <div className="container mx-auto px-6 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">¿Dónde encontrarnos?</h2>
                        <p className="text-muted-foreground text-xl">Ven a visitarnos al local original</p>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex flex-col items-center gap-6 p-12 rounded-[40px] bg-primary text-black shadow-2xl shadow-primary/20 cursor-pointer"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=Calle+Río+Cares+2+Pola+de+Laviana`, '_blank')}
                    >
                        <MapPin className="w-16 h-16 animate-bounce" />
                        <div className="space-y-2">
                            <p className="text-2xl font-black uppercase tracking-tight">Calle Río Cares, 2</p>
                            <p className="text-xl font-bold">Pola de Laviana, Asturias</p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
