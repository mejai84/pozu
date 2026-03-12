
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function Preloader() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulamos un tiempo mínimo de carga para que se vea la animación (2.5 segundos)
        const timer = setTimeout(() => {
            setLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Fondo con resplandor dorado sutil */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" 
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        {/* El Logo de POZU con animación de entrada */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20,
                                delay: 0.2 
                            }}
                            className="relative"
                        >
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/30 p-1 shadow-[0_0_50px_rgba(255,184,0,0.3)] bg-black">
                                <Image
                                    src="/images/logo.jpg"
                                    alt="Logo Pozu"
                                    fill
                                    className="object-cover rounded-full"
                                />
                            </div>
                            
                            {/* Anillo de carga rotativo */}
                            <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]">
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r="48%"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-primary/40"
                                    strokeDasharray="10 10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />
                            </svg>
                        </motion.div>

                        {/* Textos de Presentación */}
                        <div className="text-center space-y-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#E8E0D5] drop-shadow-[0_0_10px_rgba(255,184,0,0.5)]"
                            >
                                POZU <span className="text-primary">2.0</span>
                            </motion.h2>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
                                <p className="text-xs md:text-sm font-bold tracking-[0.4em] text-muted-foreground uppercase animate-pulse">
                                    Calentando la plancha...
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Líneas de velocidad de fondo */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: i * 0.4,
                                    ease: "linear"
                                }}
                                className="absolute h-px w-64 bg-gradient-to-r from-transparent via-primary to-transparent"
                                style={{ top: `${15 + i * 15}%`, left: 0 }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
