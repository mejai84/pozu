"use client"

import { Navbar } from "@/components/store/navbar"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { 
    ChefHat, 
    Bike, 
    Home, 
    Clock, 
    CheckCircle2, 
    Package, 
    MapPin, 
    Phone,
    ArrowRight,
    Loader2,
    Zap,
    Sparkles,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Tipos reflejados de la DB
type TrackingStatus = 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'

interface OrderTracking {
    id: string
    status: TrackingStatus
    created_at: string
    delivery_address: any
    customer_phone?: string
    total: number
    order_items: any[]
    payment_status?: string
    payment_link?: string
}

const statusConfig = {
    confirmed: { 
        label: 'Confirmado', 
        icon: CheckCircle2, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10',
        desc: 'Tu pedido ha sido recibido por el cuartel general.'
    },
    preparing: { 
        label: 'En Cocina', 
        icon: ChefHat, 
        color: 'text-orange-500', 
        bg: 'bg-orange-500/10',
        desc: 'Nuestros chefs están dándole fuego a la parrilla.'
    },
    ready: { 
        label: 'Preparado', 
        icon: Package, 
        color: 'text-primary', 
        bg: 'bg-primary/10',
        desc: '¡Todo listo! Tu burger está esperando su transporte.'
    },
    out_for_delivery: { 
        label: 'En Reparto', 
        icon: Bike, 
        color: 'text-purple-500', 
        bg: 'bg-purple-500/10',
        desc: 'El repartidor está navegando hacia tu ubicación.'
    },
    delivered: { 
        label: 'Entregado', 
        icon: Home, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/10',
        desc: '¡Misión cumplida! Disfruta de la mejor burger.'
    },
    cancelled: { 
        label: 'Cancelado', 
        icon: AlertCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-500/10',
        desc: 'Hubo un problema con tu pedido. Contacta con nosotros.'
    }
}

const steps: TrackingStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']

function TrackingContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('id')
    const [order, setOrder] = useState<OrderTracking | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) {
            setLoading(false)
            return
        }

        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(name))')
                .eq('id', orderId)
                .maybeSingle()  // .single() returns 406 if no row found; .maybeSingle() returns null safely
            
            if (data) setOrder({
                ...data,
                order_items: data.order_items || []  // fallback if no items yet
            })
            setLoading(false)
        }

        fetchOrder()

        // Realtime para actualizaciones de estado
        const channel = supabase
            .channel(`tracking:${orderId}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'orders', 
                filter: `id=eq.${orderId}` 
            }, (payload) => {
                setOrder(prev => prev ? { 
                    ...prev, 
                    status: payload.new.status,
                    payment_status: payload.new.payment_status 
                } : null)
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [orderId])

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Rastreando señal...</p>
        </div>
    )

    if (!order) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black italic uppercase italic">Señal Perdida</h1>
                <p className="text-muted-foreground max-w-xs mx-auto">No hemos podido encontrar este pedido en nuestro radar espacial.</p>
            </div>
            <Link href="/menu">
                <Button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black transition-all font-black uppercase italic">Volver al Menu</Button>
            </Link>
        </div>
    )

    const currentStatus = order.status as TrackingStatus
    const isUnpaid = order.payment_status === 'unpaid' && order.payment_link && order.payment_link !== '';
    
    // Si no está pagado, forzamos un estado visual de alerta
    const config = isUnpaid ? {
        label: 'PAGO PENDIENTE',
        icon: AlertCircle,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        desc: 'Tu pedido está en el radar, pero necesitamos confirmar el pago para enviarlo a la parrilla.'
    } : (statusConfig[currentStatus] || statusConfig.confirmed);

    const currentStepIndex = steps.indexOf(currentStatus === 'ready' ? 'preparing' : (currentStatus as any))

    // Formatear dirección
    const fullAddress = typeof order.delivery_address === 'string' 
        ? order.delivery_address 
        : (order.delivery_address?.street || order.delivery_address?.line1 || 'No especificada');

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Ambient Background */}
            <div className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[150px] -z-10 animate-pulse",
                isUnpaid ? "bg-amber-500/10" : "bg-primary/5"
            )} />

            <div className="flex-1 container mx-auto px-6 pt-32 pb-20 max-w-5xl">
                <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
                    
                    {/* Main Tracking Section */}
                    <div className="space-y-12">
                        {/* Status Hero Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "bg-[#0A0A0A] border rounded-[3rem] p-10 relative overflow-hidden shadow-2xl transition-colors duration-500",
                                isUnpaid ? "border-amber-500/20 shadow-amber-500/5" : "border-white/5 shadow-black"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <config.icon className="w-48 h-48" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] border animate-pulse", config.bg, config.color, `border-current/20`)}>
                                        <Zap className="w-3 h-3 fill-current" />
                                        {config.label}
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                                        {isUnpaid ? 'ESPERANDO' : (currentStatus === 'preparing' ? 'En la' : 'Tu pedido')} <br />
                                        <span className={cn("italic", isUnpaid ? "text-amber-500" : "text-primary")}>
                                            {isUnpaid ? 'EL PAGO' : (currentStatus === 'preparing' ? 'PARRILLA' : config.label.toUpperCase())}
                                        </span>
                                    </h1>
                                    <p className="text-muted-foreground text-lg font-medium max-w-md">{config.desc}</p>
                                    
                                    {isUnpaid && (
                                        <div className="pt-4">
                                            <a href={order.payment_link} target="_blank" rel="noopener noreferrer">
                                                <Button className="h-16 px-10 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase italic tracking-tighter text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] group transition-all">
                                                    Completar Pago Ahora
                                                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="relative">
                                        <div className={cn("absolute -inset-4 blur-2xl rounded-full animate-ping", isUnpaid ? "bg-amber-500/20" : "bg-primary/20")} />
                                        <div className={cn("w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl", isUnpaid ? "bg-amber-500 text-black" : "bg-primary text-black")}>
                                            <config.icon className="w-12 h-12" />
                                        </div>
                                    </div>
                                    <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                                        {isUnpaid ? 'ACCIÓN REQUERIDA' : 'LOCALIZADO EN RADAR'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Progress Stepper */}
                        <div className="px-6 py-12 relative">
                            <div className="absolute left-12 right-12 top-1/2 h-1 bg-white/5 -translate-y-1/2 rounded-full" />
                            <div 
                                className="absolute left-12 top-1/2 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000" 
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }}
                            />
                            
                            <div className="relative z-10 flex justify-between">
                                {steps.map((step, idx) => {
                                    const stepConfig = statusConfig[step]
                                    const isCompleted = idx <= currentStepIndex
                                    const isActive = idx === currentStepIndex

                                    return (
                                        <div key={step} className="flex flex-col items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                                isCompleted ? "bg-primary border-primary shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-110" : "bg-[#0A0A0A] border-white/10 grayscale opacity-40",
                                                isActive && "animate-bounce-slow"
                                            )}>
                                                <stepConfig.icon className={cn("w-6 h-6", isCompleted ? "text-black" : "text-white")} />
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest transition-all",
                                                isCompleted ? "text-white" : "text-muted-foreground opacity-40"
                                            )}>{stepConfig.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order Recap */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                            <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                <Package className="w-6 h-6 text-primary" /> Detalles del Arsenal
                            </h3>
                            <div className="space-y-6">
                                {order.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-primary border border-white/5 group-hover:border-primary/20 transition-all">
                                                {item.quantity}
                                            </div>
                                            <span className="text-lg font-black italic uppercase text-white/80 group-hover:text-white transition-colors">
                                                {item.products?.name || "Especial Rockstar"}
                                            </span>
                                        </div>
                                        <span className="font-mono text-white/40 font-bold">{(item.unit_price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total de la Operación</span>
                                <span className="text-3xl font-black italic text-primary">{order.total.toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {/* Delivery Info */}
                        <div className="bg-primary border border-primary/20 rounded-[2.5rem] p-8 text-black shadow-2xl relative overflow-hidden">
                            <div className="absolute -bottom-4 -right-4 opacity-10">
                                <MapPin className="w-32 h-32" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Base de Entrega</h4>
                            <div className="space-y-6 relative z-10">
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 shrink-0 mt-1" />
                                    <div>
                                        <p className="font-black italic uppercase leading-none mb-2">Street HQ</p>
                                        <p className="text-sm font-bold opacity-80">{fullAddress}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8 pt-8 border-t border-black/10">
                                    <Phone className="w-6 h-6 shrink-0" />
                                    <div>
                                        <p className="font-black italic uppercase leading-none mb-1">Contacto Radar</p>
                                        <p className="text-sm font-bold opacity-80">{order.customer_phone || 'Sin número registrado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA / Support */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 space-y-6 text-center">
                            <Sparkles className="w-10 h-10 text-primary mx-auto animate-pulse" />
                            <div className="space-y-2">
                                <h4 className="text-xl font-black italic uppercase">¿Problemas con la Flota?</h4>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Nuestra IA está lista para asistirte o puedes llamar a la base directamente.</p>
                            </div>
                            <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                Contactar Soporte <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            
            <style jsx global>{`
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }
            `}</style>
        </div>
    )
}


export default function TrackingPage() {
    return (
        <Suspense fallback={<div>Cargando Radar...</div>}>
            <TrackingContent />
        </Suspense>
    )
}
