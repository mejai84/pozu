"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { CheckCircle2, Loader2, ArrowRight, Home, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/store/navbar"

function PagoExitosoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    // Stripe puede pasar session_id o simplemente redirigir sin params
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('order_id') || searchParams.get('id')

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')

    useEffect(() => {
        const findOrder = async () => {
            setLoading(true)

            if (orderId) {
                // Retry up to 3 times (1.5s apart) to handle Stripe→n8n race condition
                let data = null
                for (let attempt = 0; attempt < 3; attempt++) {
                    if (attempt > 0) await new Promise(r => setTimeout(r, 1500))
                    const result = await supabase
                        .from('orders')
                        .select('id, status, payment_status, total, items, customer_name, guest_info, delivery_address')
                        .eq('id', orderId)
                        .maybeSingle()  // returns null instead of 406 when no rows found

                    if (result.data) { data = result.data; break }
                }

                if (data) {
                    setOrder(data)
                    setStatus(data.payment_status === 'paid' ? 'success' : 'pending')
                    setLoading(false)
                    return
                }
            }

            // Sin parámetros suficientes — mostrar confirmación genérica
            setStatus('success')
            setLoading(false)
        }

        findOrder()

        // Escuchar actualización de pago en realtime si tenemos order_id
        if (orderId) {
            const channel = supabase
                .channel(`pago-exitoso:${orderId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                }, (payload) => {
                    if (payload.new.payment_status === 'paid') {
                        setStatus('success')
                        setOrder((prev: any) => ({ ...prev, ...payload.new }))
                    }
                })
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }
    }, [orderId])

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">
                Verificando pago...
            </p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center space-y-12">

                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="relative"
                >
                    <div className="w-28 h-28 bg-primary rounded-[40px] flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.5)] relative z-10">
                        <CheckCircle2 className="w-14 h-14 text-black" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -inset-6 bg-primary/20 blur-3xl rounded-full animate-ping" />
                </motion.div>

                {/* Texts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 max-w-lg"
                >
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                        ¡PAGO <span className="text-primary italic">RECIBIDO</span>!
                    </h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">
                        Tu pedido está confirmado y ya está en cocina 🍔🔥
                    </p>

                    {order && (
                        <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-primary/60">Resumen</p>
                            {order.customer_name && (
                                <p className="text-lg font-black italic uppercase">
                                    {order.customer_name}
                                </p>
                            )}
                            {order.items?.detalle && (
                                <p className="text-sm text-white/70 font-medium">{order.items.detalle}</p>
                            )}
                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total pagado</span>
                                <span className="text-2xl font-black italic text-primary">{order.total?.toFixed(2)}€</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                >
                    {orderId ? (
                        <Link href={`/pedidos/tracking?id=${orderId}`} className="flex-1">
                            <button className="w-full h-16 bg-primary text-black font-black uppercase italic text-sm tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-[0_10px_40px_rgba(234,179,8,0.3)] hover:shadow-primary/50 group">
                                <Package className="w-5 h-5" />
                                Seguir mi Pedido
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/pedidos" className="flex-1">
                            <button className="w-full h-16 bg-primary text-black font-black uppercase italic text-sm tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-[0_10px_40px_rgba(234,179,8,0.3)] hover:shadow-primary/50 group">
                                <Package className="w-5 h-5" />
                                Ver mis Pedidos
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    )}

                    <Link href="/" className="flex-1">
                        <button className="w-full h-16 bg-white/5 border border-white/10 font-black uppercase italic text-sm tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                            <Home className="w-5 h-5" />
                            Inicio
                        </button>
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-muted-foreground font-medium uppercase tracking-widest"
                >
                    Recibirás una confirmación por el canal donde hiciste el pedido
                </motion.p>
            </main>
        </div>
    )
}

export default function PagoExitosoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PagoExitosoContent />
        </Suspense>
    )
}
