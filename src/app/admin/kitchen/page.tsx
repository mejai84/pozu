"use client"

import { Button } from "@/components/ui/button"
import { Clock, Check, AlertTriangle, ArrowLeft, RefreshCw, Loader2, Flame, Bell, Eye, X, ZoomIn, ChefHat, Timer, Users, User, Phone, Zap, Printer } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { printOrderTicket } from "@/lib/utils/print-ticket"

type OrderItem = {
    quantity: number
    customizations: any
    products: {
        name: string
    } | null
}

type Order = {
    id: string
    created_at: string
    status: string
    order_items: OrderItem[]
    guest_info?: any
}

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [lastFetch, setLastFetch] = useState<Date>(new Date())
    const [isAlertEnabled, setIsAlertEnabled] = useState(true)
    const [businessInfo, setBusinessInfo] = useState<any>({
        business_name: "Pozu 2.0",
        address: "Pozu Restaurant",
        phone: "600 000 000"
    })

    const playAlertSound = () => {
        if (!isAlertEnabled) return
        try {
            const audio = new Audio('/sounds/notification.mp3') // Assume we have a sound or fallback
            // We use a simple beep fallback if file not present
            audio.play().catch(() => {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(800, ctx.currentTime)
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
                gain.gain.setValueAtTime(0.5, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
                osc.start()
                osc.stop(ctx.currentTime + 0.5)
            })
        } catch (e) {}
    }

    const fetchOrders = async (currentOrders: Order[]) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    quantity,
                    customizations,
                    products (
                        name
                    )
                )
            `)
            .in('status', ['confirmed', 'preparing'])
            .order('created_at', { ascending: true })

        if (!error && data) {
            // Lógica de alerta por nuevos pedidos confirmados
            const currentIds = new Set(currentOrders.map(o => o.id))
            const newConfirmedOrders = data.filter(o => !currentIds.has(o.id))
            
            if (newConfirmedOrders.length > 0 && currentOrders.length > 0) {
                playAlertSound()
            }
            
            setOrders(data as any)
        }
        
        setLoading(false)
        setLastFetch(new Date())
    }

    const fetchSettings = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'business_info').single()
        if (data?.value) setBusinessInfo(data.value)
    }

    useEffect(() => {
        fetchOrders([])
        fetchSettings()
        const interval = setInterval(() => {
            setOrders(current => {
                fetchOrders(current)
                return current
            })
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic UI
        if (newStatus === 'ready') {
            setOrders(prev => prev.filter(o => o.id !== id))
        } else {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
        }

        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
        if (error) {
            console.error(error)
            fetchOrders(orders) // Rollback
        }
        
        if (selectedOrder?.id === id) {
            if (newStatus === 'ready') setSelectedOrder(null)
            else setSelectedOrder({...selectedOrder, status: newStatus})
        }
    }

    const getElapsedMinutes = (dateString: string) => {
        const start = new Date(dateString).getTime()
        const now = new Date().getTime()
        return Math.floor((now - start) / 60000)
    }

    const { preparing, confirmed } = useMemo(() => ({
        preparing: orders.filter(o => o.status === 'preparing'),
        confirmed: orders.filter(o => o.status === 'confirmed')
    }), [orders])

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-10 font-sans selection:bg-orange-500 selection:text-white">
            {/* HUD KDS Pro */}
            <header className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 bg-[#111] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[100px] -z-10 rounded-full" />
                
                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <Link href="/admin/orders">
                        <Button variant="ghost" className="h-16 w-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            KDS <span className="text-orange-500">POZU</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">Cocina en tiempo real v2.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto justify-end">
                    <div className="flex gap-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                            <p className="text-[9px] font-black uppercase text-orange-500/60 mb-1">En Plancha</p>
                            <p className="text-3xl font-black italic">{preparing.length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50 mb-1">En Cola</p>
                            <p className="text-3xl font-black italic">{confirmed.length}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={isAlertEnabled ? "default" : "outline"} 
                                size="icon" 
                                onClick={() => setIsAlertEnabled(!isAlertEnabled)} 
                                className={`h-12 w-12 rounded-xl border-white/10 ${isAlertEnabled ? 'bg-orange-500 text-black hover:bg-orange-600' : 'bg-transparent text-muted-foreground'}`}
                                title={isAlertEnabled ? "Sonido Activado" : "Sonido Desactivado"}
                            >
                                <Bell className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => fetchOrders(orders)} className={`h-12 w-12 rounded-xl hover:bg-white/10 border border-white/10 ${loading ? "animate-spin text-orange-500" : "text-white"}`}>
                                <RefreshCw className="w-5 h-5" />
                            </Button>
                        </div>
                        <span className="text-[8px] font-bold opacity-30 uppercase">{lastFetch.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                    </div>
                </div>
            </header>

            {/* Matrix Grid */}
            <AnimatePresence mode="popLayout">
                {orders.length === 0 && !loading ? (
                    <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-[#0A0A0A]">
                        <ChefHat className="w-32 h-32 text-white/5 mb-8" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter opacity-10">Cocina Despejada</h2>
                        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-xs opacity-40">No hay comandas pendientes de fuego</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {orders.map((order, idx) => (
                            <KDSCard 
                                key={order.id} 
                                order={order} 
                                index={idx}
                                onMarchar={() => updateStatus(order.id, 'preparing')}
                                onListo={() => updateStatus(order.id, 'ready')}
                                onExpand={() => setSelectedOrder(order)}
                                minutes={getElapsedMinutes(order.created_at)}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Industrial Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 50 }} 
                            className="bg-[#0D0D0D] border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
                        >
                            {/* Modal Header con Brillo dinámico */}
                            <div className={`p-10 flex justify-between items-center relative overflow-hidden ${selectedOrder.status === 'preparing' ? 'bg-orange-500 text-black' : 'bg-[#151515] text-white border-b border-white/5'}`}>
                                {selectedOrder.status === 'preparing' && <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse" />}
                                <div className="relative z-10">
                                    <h2 className="text-6xl font-black italic tracking-tighter">ID #{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
                                    <div className="flex items-center gap-6 mt-4 text-xl font-black italic uppercase tracking-widest opacity-80">
                                        <div className="flex items-center gap-2"><Timer className="w-6 h-6" /> {getElapsedMinutes(selectedOrder.created_at)} MIN</div>
                                        <div>•</div>
                                        <div className="flex items-center gap-2">{selectedOrder.status === 'preparing' ? '🔥 ACTIVADO' : '🧊 EN COLA'}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="h-20 w-20 rounded-3xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all relative z-10 border border-black/5">
                                    <X className="w-10 h-10" />
                                </button>
                            </div>

                            {/* Huge Items List */}
                            <div className="p-12 flex-1 overflow-y-auto no-scrollbar space-y-12">
                                <div className="space-y-6">
                                    <label className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground opacity-30 block text-center">Detalle Comanda</label>
                                    <div className="grid gap-4">
                                        {selectedOrder.order_items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-8 p-8 bg-white/5 rounded-[2rem] border border-white/5">
                                                <span className={`text-6xl font-black px-8 py-4 rounded-3xl min-w-[6rem] text-center shadow-2xl ${selectedOrder.status === 'preparing' ? 'bg-orange-400 text-black' : 'bg-white/10 text-white'}`}>
                                                    {item.quantity}
                                                </span>
                                                <div className="space-y-2">
                                                    <p className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                                                        {item.products?.name || "Especialidad Pozu"}
                                                    </p>
                                                    {item.customizations?.notes && (
                                                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-3">
                                                            <p className="text-primary text-xl font-black italic uppercase tracking-wider">
                                                                → {item.customizations.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.customizations && Object.entries(item.customizations).map(([k, v]) => (k !== 'notes' && v) ? (
                                                        <span key={k} className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-black uppercase italic rounded-md border border-red-500/20 mr-2">SIN {k}</span>
                                                    ) : null)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Identidad del Cliente</label>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><User className="w-6 h-6" /></div>
                                            <p className="text-2xl font-black italic uppercase tracking-tight">{selectedOrder.guest_info?.name || "Cliente P"}</p>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Canal de Contacto</label>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Phone className="w-6 h-6" /></div>
                                            <p className="text-2xl font-black italic tracking-tight font-mono">{selectedOrder.guest_info?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heavy Action Bar */}
                            <div className="p-10 border-t border-white/5 flex gap-6 bg-black">
                                <Button variant="ghost" onClick={() => printOrderTicket(selectedOrder, businessInfo)} className="h-24 px-10 border border-white/10 hover:bg-white/5 gap-3">
                                    <Printer className="w-8 h-8 text-primary" />
                                </Button>
                                <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="h-24 flex-1 text-2xl font-black uppercase italic tracking-widest hover:bg-white/5 rounded-[1.5rem] border border-white/5">VOLVER</Button>
                                {selectedOrder.status === 'pending' ? (
                                    <Button onClick={() => updateStatus(selectedOrder.id, 'preparing')} className="h-24 flex-[2] text-4xl font-black italic uppercase tracking-tighter bg-orange-500 text-black hover:bg-orange-600 rounded-[1.5rem] shadow-2xl shadow-orange-500/20 gap-4">
                                        MARCHAR COMANDA <Zap className="w-8 h-8" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => updateStatus(selectedOrder.id, 'ready')} className="h-24 flex-[2] text-4xl font-black italic uppercase tracking-tighter bg-green-600 text-black hover:bg-green-500 rounded-[1.5rem] shadow-2xl shadow-green-500/20 gap-4">
                                        DESPACHAR YA <Check className="w-8 h-8" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes pulse-intense {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .pulse-kitchen { animation: pulse-intense 2s infinite ease-in-out; }
            `}</style>
        </div>
    )
}

function KDSCard({ order, onMarchar, onListo, onExpand, minutes, index }: any) {
    const isPreparing = order.status === 'preparing'
    const isUrgent = minutes > 15 && !isPreparing

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group flex flex-col rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 bg-[#0A0A0A] ${isPreparing ? 'border-orange-500 shadow-[0_0_50px_-15px_rgba(249,115,22,0.4)] scale-100 z-10' : isUrgent ? 'border-red-600 shadow-[0_0_40px_-15px_rgba(220,38,38,0.3)] animate-pulse' : 'border-white/10 grayscale-[0.5] hover:grayscale-0 hover:border-white/30'}`}
        >
            {/* Header Ticket */}
            <div className={`p-5 flex justify-between items-start transition-colors duration-500 ${isPreparing ? 'bg-orange-500 text-black' : isUrgent ? 'bg-red-600 text-white' : 'bg-white/5 text-white'}`}>
                <div>
                    <h3 className="text-2xl font-black italic tracking-tighter">#{order.id.split('-')[0].toUpperCase()}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPreparing ? 'bg-black/10' : 'bg-white/10'}`}>
                            {isPreparing ? 'EN PLANCHA 🔥' : isUrgent ? 'DEMORADO ⚠️' : 'EN COLA'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black italic tracking-tighter font-mono ${isPreparing ? 'text-black/80' : 'text-primary'}`}>{minutes}m</div>
                </div>
            </div>

            {/* Content Ticket */}
            <div className="p-6 flex-1 space-y-4">
                <div className="space-y-3 min-h-[140px]">
                    {order.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-4">
                            <span className={`text-xl font-black px-2 py-1 rounded-lg min-w-[2.2rem] text-center border-b-2 ${isPreparing ? 'bg-orange-500/20 text-orange-500 border-orange-500/40' : 'bg-white/10 text-white border-white/10'}`}>
                                {item.quantity}
                            </span>
                            <div className="space-y-0.5">
                                <p className="font-bold text-lg uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors">{item.products?.name || "Special"}</p>
                                {item.customizations?.notes && (
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 p-2 rounded mt-2 italic shadow-inner">
                                        → {item.customizations.notes}
                                    </p>
                                )}
                                {item.customizations && Object.entries(item.customizations).some(([k, v]) => k !== 'notes' && v) && (
                                    <p className="text-[9px] font-black text-red-500/80 uppercase tracking-widest mt-1">PERSONALIZADO</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-40">
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{order.guest_info?.name || "C. Registrado"}</span>
                    </div>
                    <button onClick={onExpand} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ZoomIn className="w-4 h-4 text-muted-foreground hover:text-white" /></button>
                </div>
            </div>

            {/* Industrial Button Bar */}
            <div className="p-3 bg-white/5 gap-2 grid grid-cols-[auto_1fr]">
                <Button variant="ghost" onClick={onExpand} className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5">
                    <Eye className="w-6 h-6" />
                </Button>
                {isPreparing ? (
                    <Button onClick={onListo} className="h-14 text-lg font-black italic uppercase bg-green-600 text-black hover:bg-green-500 rounded-2xl shadow-xl shadow-green-600/10">DESPACHAR ✅</Button>
                ) : (
                    <Button onClick={onMarchar} className="h-14 text-lg font-black italic uppercase bg-orange-500 text-black hover:bg-orange-400 rounded-2xl shadow-xl shadow-orange-500/10">MARCHAR 🔥</Button>
                )}
            </div>
        </motion.div>
    )
}
