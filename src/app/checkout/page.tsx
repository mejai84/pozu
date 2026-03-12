"use client"

import { Navbar } from "@/components/store/navbar"
import { CheckoutForm } from "@/components/store/checkout-form"
import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10" />

            <div className="container mx-auto px-6 pt-32 sm:pt-48 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-bold border border-green-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        Pago 100% Seguro
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center uppercase italic">
                        Finalizar <span className="text-gradient">Pedido</span>
                    </h1>
                </motion.div>

                <div className="max-w-6xl mx-auto">
                    <CheckoutForm />
                </div>
            </div>
        </div>
    )
}
