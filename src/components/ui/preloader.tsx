
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function Preloader() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasPreloaded = sessionStorage.getItem('pozu_preloaded')
            const hasHash = window.location.hash.length > 0

            // Comentamos el skip para que se vea siempre durante el ajuste de diseño
            /*
            if (hasPreloaded || hasHash) {
                setLoading(false)
                return
            }
            */

            // Simulamos un tiempo mínimo de carga para que se vea la animación (3 segundos)
            const timer = setTimeout(() => {
                setLoading(false)
                sessionStorage.setItem('pozu_preloaded', 'true')
            }, 3000)

            return () => clearTimeout(timer)
        }
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

                    <div className="relative z-10 flex flex-col items-center gap-12">
                        {/* El Logo Horizontal de POZU con animación de latido suave */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 20,
                                delay: 0.2 
                            }}
                            className="relative w-[180px] h-[60px] md:w-[260px] md:h-[80px]"
                        >
                            <Image
                                src="/images/logo_cropped.png"
                                alt="Logo Pozu 2.0"
                                fill
                                className="object-contain brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
                            />
                        </motion.div>
                        <div className="text-center space-y-4 mt-8 px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="space-y-4"
                            >
                                <motion.h2 
                                    animate={{ 
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{ 
                                        duration: 3,
                                        times: [0, 0.1, 0.9, 1],
                                        repeat: Infinity
                                    }}
                                    className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white"
                                >
                                    ¿Hambre de algo <span className="text-primary">legendario</span>?
                                </motion.h2>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
                                    <p className="text-[10px] md:text-xs font-black tracking-[0.3em] text-primary uppercase">
                                        Preparando tu experiencia Pozu 2.0
                                    </p>
                                </div>
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
