import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase/client"
import { DashboardStats, WeeklyRevenueData, TopProduct, RecentOrder } from '../types'

export const useDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [stats, setStats] = useState<DashboardStats>({
        todayRevenue: 0,
        yesterdayRevenue: 0,
        activeOrders: 0,
        totalOrdersToday: 0,
        yesterdayOrders: 0,
        newCustomers: 0,
        todayReservations: 0
    })
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueData[]>([])

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
        const { data: ordersToday } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', todayISO)

        // 2. Fetch Yesterday's Orders for comparison
        const { data: ordersYesterday } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', yesterdayISO)
            .lt('created_at', todayISO)

        if (ordersToday) {
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
        const { data: recent } = await supabase
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

        if (recent) {
            setRecentOrders(recent as any[])
        }

        // 4. Top Products
        const { data: items } = await supabase
            .from('order_items')
            .select('quantity, unit_price, products(name)')
            .gte('created_at', todayISO)

        if (items) {
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

        // 5. Weekly Revenue
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 6)
        weekAgo.setHours(0, 0, 0, 0)

        const { data: weekOrders } = await supabase
            .from('orders')
            .select('created_at, total')
            .gte('created_at', weekAgo.toISOString())

        if (weekOrders) {
            const dailyData: Record<string, number> = {}
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekAgo)
                date.setDate(date.getDate() + i)
                const dateStr = date.toISOString().split('T')[0]
                dailyData[dateStr] = 0
            }

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
        const channel = supabase.channel('dashboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return {
        stats,
        recentOrders,
        topProducts,
        weeklyRevenue,
        loading,
        userRole,
        refresh: fetchData
    }
}
