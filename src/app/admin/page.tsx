"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

// Función simple para formatear hora
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Componente Card simple inline para no crear mas archivos por ahora
const StatsCard = ({ title, value, icon: Icon, trend, trendUp, loading }: any) => (
    <div className="bg-card border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mt-3" />
                ) : (
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                )}
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
                <Icon className="w-6 h-6 text-primary" />
            </div>
        </div>
        <div className={`text-xs font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
            {trend} vs ayer
        </div>
    </div>
)

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        todayRevenue: 0,
        activeOrders: 0,
        totalOrdersToday: 0,
        newCustomers: 0
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [topProducts, setTopProducts] = useState<any[]>([])

    const fetchData = async () => {
        setLoading(true)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayISO = today.toISOString()

        // 1. Fetch Today's Orders & Stats
        const { data: ordersToday, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', todayISO)

        if (!ordersError && ordersToday) {
            const revenue = ordersToday.reduce((acc, order) => acc + (order.total || 0), 0)
            const active = ordersToday.filter(o => !['delivered', 'cancelled'].includes(o.status)).length

            setStats(prev => ({
                ...prev,
                todayRevenue: revenue,
                totalOrdersToday: ordersToday.length,
                activeOrders: active
            }))
        }

        // 2. Fetch Recent Orders (limit 5)
        const { data: recent, error: recentError } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    quantity,
                    products (name)
                )
            `)
            .order('created_at', { ascending: false })
            .limit(5)

        if (!recentError && recent) {
            setRecentOrders(recent)
        }

        // 3. Top Products (Simplified aggregation)
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('quantity, products(name)')
            .gte('created_at', todayISO)

        if (!itemsError && items) {
            const counts: { [key: string]: number } = {}
            items.forEach((item: any) => {
                const name = item.products?.name || 'Desconocido'
                counts[name] = (counts[name] || 0) + item.quantity
            })
            const sorted = Object.entries(counts)
                .map(([name, sales]) => ({ name, sales }))
                .sort((a, b) => (b.sales as number) - (a.sales as number))
                .slice(0, 4)
            setTopProducts(sorted)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        // Opcional: Real-time subscription
        const channel = supabase.channel('dashboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Bienvenido al panel de control de Pozu 2.0</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
                    <TrendingUp className="w-4 h-4" /> Actualizar
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Ingresos Hoy"
                    value={`${stats.todayRevenue.toFixed(2)}€`}
                    icon={DollarSign}
                    trend="+0%"
                    trendUp={true}
                    loading={loading}
                />
                <StatsCard
                    title="Pedidos Activos"
                    value={stats.activeOrders}
                    icon={Clock}
                    trend="+0"
                    trendUp={true}
                    loading={loading}
                />
                <StatsCard
                    title="Pedidos Hoy"
                    value={stats.totalOrdersToday}
                    icon={ShoppingBag}
                    trend="+0%"
                    trendUp={true}
                    loading={loading}
                />
                <StatsCard
                    title="Nuevos Clientes"
                    value={stats.newCustomers}
                    icon={Users}
                    trend="+0%"
                    trendUp={true}
                    loading={loading}
                />
            </div>

            {/* Recent Orders Preview */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6">Últimos Pedidos</h3>
                    <div className="space-y-4">
                        {recentOrders.length === 0 && !loading && (
                            <p className="text-center py-10 text-muted-foreground italic">No hay pedidos recientes</p>
                        )}
                        {recentOrders.map((order, i) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        #{order.id.split('-')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold">{order.guest_info?.name || 'Cliente'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatTime(new Date(order.created_at))} • {order.order_items?.length || 0} Items
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold">{order.total?.toFixed(2)}€</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Items */}
                <div className="bg-card border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6">Top Productos (Hoy)</h3>
                    <div className="space-y-6">
                        {topProducts.length === 0 && !loading && (
                            <p className="text-center py-10 text-muted-foreground italic">Sin ventas hoy</p>
                        )}
                        {topProducts.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground font-mono text-sm">0{i + 1}</span>
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">{item.sales} ventas</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

