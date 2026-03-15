export interface ReportData {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
    topProducts: { name: string; sales: number; revenue: number }[]
    dailyRevenue: { date: string; revenue: number; orders: number }[]
}

export type DateRange = 'today' | 'week' | 'month' | 'custom'
