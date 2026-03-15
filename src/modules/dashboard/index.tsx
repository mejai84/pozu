"use client"

import { DollarSign, ShoppingBag, Clock, Users } from "lucide-react"
import { useDashboard } from "./hooks/useDashboard"
import { StatsCard } from "./components/StatsCard"
import { AnalyticalCharts } from "./components/AnalyticalCharts"
import { OperationalFeed } from "./components/OperationalFeed"
import { DashboardHeader } from "./components/DashboardHeader"

export const DashboardModule = () => {
    const {
        stats,
        recentOrders,
        topProducts,
        weeklyRevenue,
        loading,
        userRole,
        refresh
    } = useDashboard()

    const calculateTrend = (today: number, yesterday: number) => {
        if (yesterday === 0) return '+100%'
        const change = ((today - yesterday) / yesterday) * 100
        return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`
    }

    return (
        <div className="space-y-10 pb-10">
            <DashboardHeader onRefresh={refresh} />

            {/* Grid de Métricas Principales */}
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

            <AnalyticalCharts
                weeklyRevenue={weeklyRevenue}
                topProducts={topProducts}
                userRole={userRole}
            />

            <OperationalFeed
                recentOrders={recentOrders}
                topProducts={topProducts}
                loading={loading}
            />
        </div>
    )
}
