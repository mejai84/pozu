export interface DashboardStats {
    todayRevenue: number
    yesterdayRevenue: number
    activeOrders: number
    totalOrdersToday: number
    yesterdayOrders: number
    newCustomers: number
    todayReservations: number
}

export interface WeeklyRevenueData {
    date: string
    day: string
    revenue: number
}

export interface TopProduct {
    name: string
    sales: number
    revenue: number
}

export interface RecentOrder {
    id: string
    created_at: string
    status: string
    total: number
    guest_info: any
    order_items: {
        quantity: number
        products: { name: string } | null
    }[]
}
