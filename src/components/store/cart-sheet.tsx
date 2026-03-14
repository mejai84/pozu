
"use client"

import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

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
                        if (currentHours < openH && nowMins < (closeMins - 24 * 60)) {
                            effectiveNowMins += 24 * 60
                        }

                        if (effectiveNowMins < openMins || effectiveNowMins > closeMins) {
                            open = false
                        }
                    }
                }
                setIsStoreOpen(open)
            } catch (error) {
                console.error("Error fetching store status:", error)
            }
        }

        fetchStoreStatus()
    }, [isCartOpen])

    if (!isCartOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={toggleCart}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-card border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        Tu Pedido
                    </h2>
                    <Button variant="ghost" size="icon" onClick={toggleCart}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-lg">Tu carrito está vacío</p>
                            <Button onClick={toggleCart} variant="outline">
                                Volver a la carta
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.uniqueId} className="flex gap-4">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                    <Image
                                        src={item.image || "/images/placeholder.png"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            {item.options && (
                                                <p className="text-[10px] text-primary font-medium italic mt-0.5 line-clamp-1">
                                                    "{item.options}"
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-bold text-primary">
                                            {(item.price * item.quantity).toFixed(2)}€
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                            <button
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.uniqueId)}
                                            className="text-xs text-muted-foreground hover:text-destructive underline"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t border-white/10 bg-white/5 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 relative">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{cartTotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Envío estimado</span>
                                <span>2.50€</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
                                <span>Total</span>
                                <span>{(cartTotal + 2.50).toFixed(2)}€</span>
                            </div>
                        </div>

                        {!isStoreOpen && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium">La tienda está cerrada en este momento. Vuelve dentro del horario de apertura.</p>
                            </div>
                        )}

                        {isStoreOpen ? (
                            <Link href="/checkout" onClick={toggleCart} className="block w-full">
                                <Button className="w-full h-14 text-lg font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-all">
                                    Tramitar Pedido
                                </Button>
                            </Link>
                        ) : (
                            <Button disabled className="w-full h-14 py-4 text-lg font-black uppercase tracking-wider rounded-xl bg-white/5 text-white/30 border border-white/10 cursor-not-allowed">
                                Tienda Cerrada
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
