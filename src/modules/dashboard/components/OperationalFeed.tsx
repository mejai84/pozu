import Link from "next/link"
import { Clock, ArrowUp, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecentOrder, TopProduct } from "../types"

interface Props {
    recentOrders: RecentOrder[]
    topProducts: TopProduct[]
    loading: boolean
}

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        case 'preparing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        case 'ready': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20'
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
}

const getStatusLabel = (status: string) => {
    const labels: any = {
        pending: 'Pendiente',
        preparing: 'En Cocina',
        ready: 'Listo',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        out_for_delivery: 'En Reparto'
    }
    return labels[status] || status
}

export const OperationalFeed = ({ recentOrders, topProducts, loading }: Props) => {
    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders Preview */}
            <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Live <span className="text-primary">Orders</span></h3>
                    <Link href="/admin/orders">
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl border-white/10 bg-white/5 font-bold hover:bg-white/10">
                            Gestor TPV <ArrowUp className="w-4 h-4 rotate-45" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {recentOrders.length === 0 && !loading && (
                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                            <Clock className="w-8 h-8 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground font-medium">Bandeja de pedidos vacía</p>
                        </div>
                    )}
                    {recentOrders.map((order) => (
                        <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-[0_0_15px_rgba(255,184,0,0.1)] group-hover:scale-110 transition-transform">
                                    {order.id.split('-')[0].substring(0, 3).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{order.guest_info?.name || 'Cliente en sala'}</p>
                                    <p className="text-xs font-mono text-muted-foreground">
                                        {formatTime(new Date(order.created_at))} • <span className="text-white/70 font-medium">{order.order_items?.length || 0} Artículos</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                                <span className="font-black italic text-xl tracking-tighter">{order.total?.toFixed(2)}€</span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border ${getStatusStyle(order.status)} shrink-0`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Items */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
                <div className="mb-8 pb-6 border-b border-white/5">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Lo Más <span className="text-primary">Vendido</span></h3>
                    <p className="text-sm text-muted-foreground mt-1">Tendencias de hoy</p>
                </div>
                <div className="space-y-4">
                    {topProducts.length === 0 && !loading && (
                        <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-muted-foreground font-medium text-sm">Faltan datos de ventas</p>
                        </div>
                    )}
                    {topProducts.map((item, i) => (
                        <div key={i} className="flex flex-col p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-md bg-[#111] flex items-center justify-center font-black text-xs text-muted-foreground border border-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        {i + 1}
                                    </div>
                                    <span className="font-bold text-sm truncate max-w-[120px]">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground bg-[#111] px-2 py-1 rounded-md">{item.sales} ud.</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(item.sales / (topProducts[0]?.sales || 1)) * 100}%` }} />
                            </div>
                            <div className="text-right">
                                <span className="font-black italic text-primary">{item.revenue.toFixed(2)}€</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
