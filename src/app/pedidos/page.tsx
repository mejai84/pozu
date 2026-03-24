"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Navbar } from "@/components/store/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ShoppingBag, 
    ArrowRight, 
    ChevronRight, 
    Clock, 
    Package, 
    CheckCircle2, 
    XCircle,
    Truck,
    UtensilsCrossed,
    Search,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface OrderItem {
    id: string
    product_id: string
    quantity: number
    unit_price: number
    customizations: any
    products: {
        name: string
        image_url: string
    }
}

interface Order {
    id: string
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
    total: number
    created_at: string
    order_items: OrderItem[]
}

const statusMap = {
    pending: { label: 'Pendiente', color: 'text-yellow-500', icon: Clock, bg: 'bg-yellow-500/10' },
    confirmed: { label: 'Confirmado', color: 'text-blue-500', icon: CheckCircle2, bg: 'bg-blue-500/10' },
    preparing: { label: 'En Cocina', color: 'text-orange-500', icon: UtensilsCrossed, bg: 'bg-orange-500/10' },
    ready: { label: 'Listo', color: 'text-green-500', icon: Package, bg: 'bg-green-500/10' },
    out_for_delivery: { label: 'En Camino', color: 'text-purple-500', icon: Truck, bg: 'bg-purple-500/10' },
    delivered: { label: 'Entregado', color: 'text-primary', icon: CheckCircle2, bg: 'bg-primary/10' },
    cancelled: { label: 'Cancelado', color: 'text-red-500', icon: XCircle, bg: 'bg-red-500/10' }
}

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isAuth, setIsAuth] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
                setLoading(false)
                return
            }

            setIsAuth(true)

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    total,
                    created_at,
                    order_items (
                        id,
                        product_id,
                        quantity,
                        unit_price,
                        customizations,
                        products (name, image_url)
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (data) setOrders(data as any)
            setLoading(false)
        }

        checkAuthAndFetch()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center pt-24 px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="max-w-md w-full text-center space-y-12"
                    >
                        <div className="w-32 h-32 bg-primary/10 rounded-[40px] border-2 border-primary mx-auto flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,184,0,0.2)] rotate-12">
                            <ShoppingBag className="w-16 h-16 text-primary" />
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none italic">
                                Tus Pedidos <br />
                                <span className="text-primary italic">Pozu</span>
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed italic">
                                Inicia sesión para revivir tus mejores momentos Pozu y seguir tus pedidos actuales.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 pt-12">
                            <Link href="/login" className="w-full">
                                <Button className="w-full h-16 bg-primary text-black font-black uppercase tracking-tighter italic text-2xl rounded-[24px]">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href="/menu" className="w-full">
                                <Button variant="ghost" className="w-full h-16 font-black uppercase tracking-tighter italic text-muted-foreground hover:text-white text-xl">
                                    Explorar la Carta
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-20">
            <Navbar />

            {/* Lights */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />

            <div className="pt-32 sm:pt-40 container mx-auto px-6 max-w-5xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Historial</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            Mis <span className="text-primary">Pedidos</span>
                        </h1>
                    </div>
                </div>

                <AnimatePresence>
                    {orders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#111] border-2 border-dashed border-white/5 rounded-[3rem] p-12 md:p-20 text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">Aún no hay pedidos</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto italic">Cuando realices tu primer pedido brutal, aparecerá aquí con todo su historial.</p>
                            </div>
                            <Link href="/menu">
                                <Button className="h-16 px-10 bg-primary text-black font-black uppercase tracking-tighter italic rounded-2xl text-xl shadow-[0_0_30px_rgba(255,184,0,0.3)] inline-flex items-center gap-3">
                                    Empezar a Pedir
                                    <ArrowRight className="w-6 h-6" />
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order, index) => {
                                const status = (statusMap as any)[order.status] || statusMap.pending
                                const StatusIcon = status.icon

                                return (
                                    <motion.div 
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group bg-[#111] border border-white/10 rounded-[2.5rem] p-6 md:p-8 hover:border-primary/40 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10 transition-colors group-hover:bg-primary/10" />

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            {/* Order Info */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full w-fit border border-white/10">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: {order.id.slice(0, 8)}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
                                                        {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <div className={`flex items-center gap-2 ${status.color}`}>
                                                        <StatusIcon className="w-5 h-5" />
                                                        <span className="text-lg font-black uppercase tracking-tighter italic">{status.label}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="flex -space-x-4">
                                                    {order.order_items.slice(0, 4).map((item, i) => (
                                                        <div 
                                                            key={item.id} 
                                                            className="w-16 h-16 rounded-2xl bg-black border-2 border-[#111] overflow-hidden shadow-lg relative group-hover:translate-y-[-4px] transition-transform"
                                                            style={{ transitionDelay: `${i * 50}ms` }}
                                                        >
                                                            <img 
                                                                src={item.products.image_url || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop'} 
                                                                alt={item.products.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                    {order.order_items.length > 4 && (
                                                        <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-[#111] flex items-center justify-center text-primary font-black text-xl italic">
                                                            +{order.order_items.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-white line-clamp-1 italic">
                                                        {order.order_items.map(item => `${item.quantity}x ${item.products.name}`).join(', ')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black text-primary italic">Total: {order.total}€</p>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex items-center md:justify-end">
                                                <Button 
                                                    variant="outline"
                                                    className="w-full md:w-fit h-14 px-8 rounded-2xl border-white/10 hover:border-primary/50 hover:bg-primary/10 group/btn transition-all font-black uppercase tracking-tighter italic text-white"
                                                >
                                                    Detalles
                                                    <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
