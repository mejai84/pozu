
"use client"

import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, AlertTriangle, Trash2, ArrowRight, Clock, PenLine } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function CartSheet() {
    const { items, removeItem, updateQuantity, cartTotal, isCartOpen, toggleCart } = useCart()
    const [isStoreOpen, setIsStoreOpen] = useState(true)

    useEffect(() => {
        if (!isCartOpen) return

        const fetchStoreStatus = async () => {
            try {
                const { data: infoData } = await supabase.from('settings').select('value').eq('key', 'business_info').single()
                const { data: hoursData } = await supabase.from('settings').select('value').eq('key', 'business_hours').single()

                let open = true
                const bInfo = infoData?.value as any
                const bHours = hoursData?.value as any

                if (bInfo && bInfo.is_open === false) {
                    open = false
                } else if (bHours) {
                    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const now = new Date()
                    const currentDay = dayMap[now.getDay()]
                    const todaySchedule = bHours[currentDay]

                    if (todaySchedule && todaySchedule.closed) {
                        open = false
                    } else if (todaySchedule) {
                        const currentHours = now.getHours()
                        const currentMinutes = now.getMinutes()
                        const [openH, openM] = (todaySchedule.open || "00:00").split(':').map(Number)
                        const [closeH, closeM] = (todaySchedule.close || "23:59").split(':').map(Number)
                        const nowMins = currentHours * 60 + currentMinutes
                        const openMins = openH * 60 + openM
                        let closeMins = closeH * 60 + closeM
                        if (closeMins < openMins) closeMins += 24 * 60
                        let effectiveNowMins = nowMins
                        if (currentHours < openH && nowMins < (closeMins - 24 * 60)) effectiveNowMins += 24 * 60
                        if (effectiveNowMins < openMins || effectiveNowMins > closeMins) open = false
                    }
                }
                setIsStoreOpen(open)
            } catch (error) {
                console.error("Error fetching store status:", error)
            }
        }
        fetchStoreStatus()
    }, [isCartOpen])

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        onClick={toggleCart}
                    />

                    {/* Panel */}
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#0A0A0A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-black/40 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <ShoppingBag className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Tu <span className="text-primary">Pedido</span></h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{items.length} {items.length === 1 ? 'Producto' : 'Productos'} seleccionados</span>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={toggleCart}
                                className="w-10 h-10 rounded-xl hover:bg-white/5 text-white/50 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Items Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-dashed border-white/20">
                                        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black italic uppercase tracking-tighter text-white">El carrito está vacío</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">¡Anímate con una Rockstar!</p>
                                    </div>
                                    <Button onClick={toggleCart} variant="outline" className="rounded-xl border-white/10 font-bold uppercase tracking-widest text-[10px] py-6 px-10">
                                        Volver a la carta
                                    </Button>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {items.map((item, idx) => (
                                        <motion.div 
                                            key={item.uniqueId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group flex gap-6 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all relative"
                                        >
                                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                                                <Image
                                                    src={item.image || "/images/placeholder.png"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-black italic uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.name}</h3>
                                                        <span className="font-black text-lg italic text-primary">
                                                            {(item.price * item.quantity).toFixed(2)}€
                                                        </span>
                                                    </div>
                                                    {item.options && (
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-xl border border-primary/20">
                                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                                <p className="text-[11px] text-primary/90 font-black uppercase tracking-tight italic">
                                                                    {item.options}
                                                                </p>
                                                            </div>
                                                            <Link 
                                                                href={`/producto/${item.id}`} 
                                                                onClick={toggleCart}
                                                                className="text-[10px] font-black uppercase text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 px-2"
                                                            >
                                                                <PenLine className="w-3 h-3" /> Modificar personalización
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-2 bg-black/60 rounded-xl p-1 border border-white/5 shadow-inner">
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white"
                                                            onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-black text-white italic">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white"
                                                            onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => removeItem(item.uniqueId)}
                                                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer Summary */}
                        {items.length > 0 && (
                            <div className="p-8 border-t border-white/5 bg-gradient-to-t from-black to-black/80 space-y-6 relative">
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                
                                <div className="space-y-3 font-bold uppercase tracking-widest text-[11px] text-muted-foreground">
                                    <div className="flex justify-between items-center">
                                        <span>Subtotal de Comida</span>
                                        <span className="text-white font-black italic text-sm">{cartTotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors">Gasto de Envío <Clock className="w-3 h-3" /></span>
                                        <span className="text-white font-black italic text-sm">2.50€</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="text-lg font-black italic text-white uppercase tracking-tighter">TOTAL DEL PEDIDO</span>
                                        <span className="text-3xl font-black italic text-primary tracking-tighter shadow-primary/20 drop-shadow-xl animate-pulse">
                                            {(cartTotal + 2.50).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                {!isStoreOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500"
                                    >
                                        <AlertTriangle className="w-6 h-6 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black uppercase italic tracking-tighter">Establecimiento Cerrado</p>
                                            <p className="text-[10px] font-bold leading-relaxed opacity-70 uppercase tracking-widest">Lo sentimos, no estamos aceptando pedidos ahora mismo. Por favor, revisa el horario.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {isStoreOpen ? (
                                    <Link href="/checkout" onClick={toggleCart} className="block group">
                                        <Button className="w-full h-20 text-2xl font-black italic uppercase tracking-tighter rounded-[1.25rem] bg-primary text-black hover:bg-primary/90 shadow-[0_10px_40px_rgba(234,179,8,0.2)] hover:shadow-[0_20px_60px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-3 relative overflow-hidden">
                                            <span>REALIZAR PEDIDO</span>
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                            <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full h-20 rounded-[1.25rem] bg-white/5 text-muted-foreground/40 font-black italic uppercase tracking-tighter text-2xl border border-white/5 cursor-not-allowed">
                                        PRÓXIMAMENTE
                                    </Button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

