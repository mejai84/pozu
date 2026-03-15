"use client"

import { Navbar } from "@/components/store/navbar"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, ShoppingCart, Sparkles, MapPin, Phone, Clock, Receipt, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

function CheckoutSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('id')
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) {
            setLoading(false)
            return
        }

        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        product:products (*)
                    )
                `)
                .eq('id', orderId)
                .single()

            if (data) setOrder(data)
            setLoading(false)
        }

        fetchOrder()
    }, [orderId])

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center relative overflow-x-hidden">
            <Navbar />

            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <main className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center">
                {/* Status Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 mb-16"
                >
                    <div className="relative inline-block">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)] relative z-10"
                        >
                            <CheckCircle2 className="w-12 h-12 text-black" />
                        </motion.div>
                        <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-ping" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-white">
                            ¡PEDIDO <span className="text-primary italic">RECIBIDO</span>!
                        </h1>
                        <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Hemos encendido los motores para tu Rockstar</p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 w-full max-w-6xl items-start">
                    {/* Digital Ticket */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group h-full"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 relative overflow-hidden shadow-2xl flex flex-col h-full">
                            {/* Decorative Cutouts for Ticket look */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border border-white/10" />
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border border-white/10" />
                            <div className="absolute left-10 right-10 top-1/2 h-px border-t border-dashed border-white/20" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black italic uppercase text-white">Ticket Digital</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Orden #{orderId?.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <Receipt className="w-8 h-8 text-white/10" />
                            </div>

                            <div className="flex-1 space-y-8 mb-12">
                                {order?.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-primary border border-white/5 group-hover/item:border-primary/30 transition-colors">
                                                {item.quantity}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black italic uppercase text-white text-lg leading-tight">{item.customizations?.name || 'Producto'}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.unit_price.toFixed(2)}€ / unidad</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-xl italic text-white/50 group-hover/item:text-white transition-colors">{(item.unit_price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-12 border-t border-white/5 mt-auto">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="text-white italic">{order?.subtotal?.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Gastos de Envío</span>
                                    <span className="text-white italic">2.50€</span>
                                </div>
                                <div className="flex justify-between items-center pt-8 border-t-2 border-primary/20">
                                    <span className="text-xl font-black italic text-white uppercase tracking-tighter">TOTAL PAGADO</span>
                                    <span className="text-5xl font-black italic text-primary tracking-tighter drop-shadow-[0_10px_20px_rgba(234,179,8,0.2)]">
                                        {order?.total?.toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Next Steps & Delivery Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 space-y-10 shadow-xl">
                            <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
                                <Clock className="w-6 h-6 text-primary" /> Entrega Estimada
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tiempo de preparación</span>
                                    <p className="text-3xl font-black italic text-white uppercase">20-30 <span className="text-primary tracking-tighter">min</span></p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Repartidor</span>
                                    <p className="text-3xl font-black italic text-white uppercase">En <span className="text-primary tracking-tighter">Camino</span></p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dirección de Envío</span>
                                        <p className="text-lg font-black italic text-white uppercase tracking-tight">{order?.delivery_address?.street || 'Dirección no disponible'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contacto</span>
                                        <p className="text-lg font-black italic text-white uppercase tracking-tight">{order?.guest_info?.phone || order?.delivery_address?.phone || 'No proporcionado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full h-20 rounded-[28px] border-white/10 text-xl font-black uppercase tracking-tighter italic gap-3 hover:bg-white/5">
                                    <Home className="w-6 h-6" /> Volver al Inicio
                                </Button>
                            </Link>
                            <Link href={orderId ? `/pedidos/tracking?id=${orderId}` : '/menu'} className="flex-1">
                                <Button className="w-full h-20 rounded-[28px] text-xl font-black uppercase tracking-tighter italic gap-3 shadow-[0_10px_40px_rgba(234,179,8,0.2)] hover:shadow-primary/40 group relative overflow-hidden">
                                    <span>Seguir Pedido</span>
                                    <ShoppingCart className="w-6 h-6" />
                                    <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Tracking Hint */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-muted-foreground"
                >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">Te avisaremos por WhatsApp cuando el pedido esté saliendo</span>
                </motion.div>
            </main>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    )
}

