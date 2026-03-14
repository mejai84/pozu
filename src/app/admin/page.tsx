"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, Loader2, ArrowUp, ArrowDown, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

// Función simple para formatear hora
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Componente Card Premium para Dashboard Pro
const StatsCard = ({ title, value, icon: Icon, trend, trendUp, loading, subtitle, href, colorClass = "from-primary/20 to-transparent" }: any) => (
    <Link href={href || '#'} className="block h-full">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 shadow-lg hover:shadow-primary/10 group h-full flex flex-col justify-between cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${trendUp ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">{title}</h3>
                {loading ? (
                    <div className="h-10 flex items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic tracking-tighter text-[#E8E0D5]">{value}</span>
                        {subtitle && <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>}
                    </div>
                )}
            </div>
        </div>
    </Link>
)

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [stats, setStats] = useState({
        todayRevenue: 0,
        yesterdayRevenue: 0,
        activeOrders: 0,
        totalOrdersToday: 0,
        yesterdayOrders: 0,
        newCustomers: 0,
        todayReservations: 0
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([])

    const fetchData = async () => {
        setLoading(true)
        
        // Fetch User Role
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()
            if (profile) setUserRole(profile.role)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayISO = today.toISOString()

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayISO = yesterday.toISOString()

        // 1. Fetch Today's Orders & Stats
        const { data: ordersToday, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', todayISO)

        // 2. Fetch Yesterday's Orders for comparison
        const { data: ordersYesterday } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', yesterdayISO)
            .lt('created_at', todayISO)

        if (!ordersError && ordersToday) {
            const revenue = ordersToday.reduce((acc, order) => acc + (order.total || 0), 0)
            const active = ordersToday.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
            const yesterdayRev = ordersYesterday?.reduce((acc, order) => acc + (order.total || 0), 0) || 0

            setStats(prev => ({
                ...prev,
                todayRevenue: revenue,
                yesterdayRevenue: yesterdayRev,
                totalOrdersToday: ordersToday.length,
                yesterdayOrders: ordersYesterday?.length || 0,
                activeOrders: active
            }))
        }

        // 3. Fetch Recent Orders (limit 5)
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

        // 4. Top Products (Simplified aggregation)
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('quantity, unit_price, products(name)')
            .gte('created_at', todayISO)

        if (!itemsError && items) {
            const counts: { [key: string]: { quantity: number; revenue: number } } = {}
            items.forEach((item: any) => {
                const name = item.products?.name || 'Desconocido'
                if (!counts[name]) {
                    counts[name] = { quantity: 0, revenue: 0 }
                }
                counts[name].quantity += item.quantity
                counts[name].revenue += item.quantity * item.unit_price
            })
            const sorted = Object.entries(counts)
                .map(([name, data]) => ({ name, sales: data.quantity, revenue: data.revenue }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
            setTopProducts(sorted)
        }

        // 5. Weekly Revenue for chart
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 6)
        weekAgo.setHours(0, 0, 0, 0)

        const { data: weekOrders } = await supabase
            .from('orders')
            .select('created_at, total')
            .gte('created_at', weekAgo.toISOString())

        if (weekOrders) {
            const dailyData: Record<string, number> = {}
            // Initialize all days
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekAgo)
                date.setDate(date.getDate() + i)
                const dateStr = date.toISOString().split('T')[0]
                dailyData[dateStr] = 0
            }

            // Add revenue
            weekOrders.forEach(order => {
                const dateStr = order.created_at.split('T')[0]
                if (dailyData[dateStr] !== undefined) {
                    dailyData[dateStr] += order.total || 0
                }
            })

            const weekData = Object.entries(dailyData).map(([date, revenue]) => ({
                date,
                day: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
                revenue
            }))
            setWeeklyRevenue(weekData)
        }

        // 6. Fetch Today's Reservations
        const { data: reservationsToday } = await supabase
            .from('reservations')
            .select('id')
            .eq('reservation_date', todayISO.split('T')[0])
            .not('status', 'eq', 'cancelled')

        if (reservationsToday) {
            setStats(prev => ({
                ...prev,
                todayReservations: reservationsToday.length
            }))
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

    const calculateTrend = (today: number, yesterday: number) => {
        if (yesterday === 0) return '+100%'
        const change = ((today - yesterday) / yesterday) * 100
        return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Cabecera del Dashboard Pro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#E8E0D5]">Dashboard <span className="text-primary">Pro</span></h1>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-mono text-white/70 backdrop-blur-md border border-white/10 shadow-sm">v2.0</span>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-xl">
                        Centro de mando central. Control total sobre ventas en línea, pagos, reservas y analítica en tiempo real de Pozu.
                    </p>
                </div>
                <Button onClick={fetchData} className="relative z-10 gap-2 font-black uppercase tracking-tighter italic h-12 px-6 rounded-2xl shadow-[0_0_20px_rgba(255,184,0,0.2)] hover:shadow-[0_0_30px_rgba(255,184,0,0.3)] transition-all">
                    <TrendingUp className="w-5 h-5" /> Sincronizar Datos
                </Button>
            </div>

            {/* Grid de Métricas Principales (Kpis Financieros y de Volumen) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {(userRole === 'admin' || userRole === 'manager') && (
                    <StatsCard
                        title="Ventas (Online + POS)"
                        value={`${stats.todayRevenue.toFixed(2)}€`}
                        subtitle={`Ayer: ${stats.yesterdayRevenue.toFixed(2)}€`}
                        icon={DollarSign}
                        trend={calculateTrend(stats.todayRevenue, stats.yesterdayRevenue)}
                        trendUp={stats.todayRevenue >= stats.yesterdayRevenue}
                        loading={loading}
                        href="/admin/reports"
                        colorClass="from-green-500/20 to-transparent"
                    />
                )}
                <StatsCard
                    title="Tráfico del Día"
                    value={stats.totalOrdersToday}
                    subtitle={`Pedidos (+${stats.yesterdayOrders} ayer)`}
                    icon={ShoppingBag}
                    trend={calculateTrend(stats.totalOrdersToday, stats.yesterdayOrders)}
                    trendUp={stats.totalOrdersToday >= stats.yesterdayOrders}
                    loading={loading}
                    href="/admin/orders"
                    colorClass="from-blue-500/20 to-transparent"
                />
                <StatsCard
                    title="En Cocina (KDS)"
                    value={stats.activeOrders}
                    subtitle="Tickets activos"
                    icon={Clock}
                    trend={stats.activeOrders.toString()}
                    trendUp={true}
                    loading={loading}
                    href="/admin/kitchen"
                    colorClass="from-orange-500/20 to-transparent"
                />
                {/* Módulo de Reservas - AHORA FUNCIONAL */}
                <StatsCard
                    title="Mesas / Reservas"
                    value={stats.todayReservations}
                    subtitle="Reservas para hoy"
                    icon={Users}
                    trend="+100%"
                    trendUp={true}
                    loading={loading}
                    href="/admin/reservations"
                    colorClass="from-purple-500/20 to-transparent"
                />
            </div>

            {/* Módulos Analíticos Avanzados - Solo Admin/Manager */}
            {(userRole === 'admin' || userRole === 'manager') && (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Gráfico de Crecimiento */}
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Metricas de <span className="text-primary">Evolución</span></h3>
                                <p className="text-sm text-muted-foreground mt-1">Ingresos brutos de los últimos 7 días</p>
                            </div>
                            <Link href="/admin/reports">
                                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-white/10 font-bold bg-white/5 hover:bg-white/10">
                                    <Eye className="w-4 h-4" /> Informe Completo
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {weeklyRevenue.map((day, i) => {
                                const maxRevenue = Math.max(...weeklyRevenue.map(d => d.revenue), 1)
                                const width = (day.revenue / maxRevenue) * 100

                                return (
                                    <div key={i} className="space-y-3 group/bar">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground group-hover/bar:text-white transition-colors">
                                                {day.day}
                                            </span>
                                            <span className="font-mono text-sm font-bold opacity-70 group-hover/bar:opacity-100 transition-opacity group-hover/bar:text-primary">
                                                {day.revenue.toFixed(2)}€
                                            </span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-1000 ease-out relative"
                                                style={{ width: `${width}%` }}
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pasarela y Pagos (Módulo Pro) */}
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 flex flex-col">
                        <div className="mb-8 pb-6 border-b border-white/5">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Control de <span className="text-primary">Pagos</span></h3>
                            <p className="text-sm text-muted-foreground mt-1">Estado de la pasarela y transacciones</p>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Stripe / Bizum</h4>
                                        <p className="text-xs font-mono text-muted-foreground mt-1">Online & Apple Pay</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 font-bold text-[10px] uppercase tracking-widest rounded-full border border-green-500/20">Activo</span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Efectivo / Caja</h4>
                                        <p className="text-xs font-mono text-muted-foreground mt-1">TPV Físico</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 font-bold text-[10px] uppercase tracking-widest rounded-full border border-yellow-500/20">Manual</span>
                                </div>
                            </div>

                            <div className="pt-6 mt-auto">
                                <Button
                                    onClick={() => window.location.href = '/admin/settings'}
                                    className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs bg-white/10 hover:bg-primary hover:text-black border border-white/10 transition-all"
                                >
                                    Configurar Pasarelas
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feed Operativo */}
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
                        {recentOrders.map((order, i) => (
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

                {/* Popular Items - Inteligencia de Negocio */}
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
        </div>
    )
}
