import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportData, DateRange } from '../types'
import { sendReportEmail as sendEmailAction } from '../actions'

export const useReports = () => {
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange>('month')
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [sendingEmail, setSendingEmail] = useState(false)

    const generateReport = async () => {
        setLoading(true)
        try {
            const now = new Date()
            let fromDate: Date

            switch (dateRange) {
                case 'today':
                    fromDate = new Date(now.setHours(0, 0, 0, 0))
                    break
                case 'week':
                    fromDate = new Date(now.setDate(now.getDate() - 7))
                    break
                case 'month':
                    fromDate = new Date(now.setMonth(now.getMonth() - 1))
                    break
                default:
                    fromDate = startDate ? new Date(startDate) : new Date(now.setMonth(now.getMonth() - 1))
            }

            const toDate = dateRange === 'custom' && endDate ? new Date(endDate) : new Date()

            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*, order_items(quantity, unit_price, products(name))')
                .gte('created_at', fromDate.toISOString())
                .lte('created_at', toDate.toISOString())

            if (ordersError) throw ordersError

            if (orders) {
                const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
                const totalOrders = orders.length
                const uniqueCustomers = new Set(orders.map(o => o.guest_info?.email || o.user_id)).size
                const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

                const productSales: Record<string, { sales: number; revenue: number }> = {}
                orders.forEach(order => {
                    order.order_items?.forEach((item: any) => {
                        const productName = item.products?.name || 'Desconocido'
                        if (!productSales[productName]) {
                            productSales[productName] = { sales: 0, revenue: 0 }
                        }
                        productSales[productName].sales += item.quantity
                        productSales[productName].revenue += item.quantity * (item.unit_price || 0)
                    })
                })

                const topProducts = Object.entries(productSales)
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 10)

                const dailyData: Record<string, { revenue: number; orders: number }> = {}
                orders.forEach(order => {
                    const date = new Date(order.created_at).toISOString().split('T')[0]
                    if (!dailyData[date]) {
                        dailyData[date] = { revenue: 0, orders: 0 }
                    }
                    dailyData[date].revenue += order.total || 0
                    dailyData[date].orders += 1
                })

                const dailyRevenue = Object.entries(dailyData)
                    .map(([date, data]) => ({ date, ...data }))
                    .sort((a, b) => a.date.localeCompare(b.date))

                setReportData({
                    totalRevenue,
                    totalOrders,
                    totalCustomers: uniqueCustomers,
                    averageOrderValue,
                    topProducts,
                    dailyRevenue
                })
            }
        } catch (error) {
            console.error('Error generating report:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        generateReport()
    }, [dateRange])

    const sendReportEmail = async (email: string) => {
        if (!email || !reportData) return
        setSendingEmail(true)
        try {
            const result = await sendEmailAction(email, reportData)
            return result
        } finally {
            setSendingEmail(false)
        }
    }

    return {
        loading,
        dateRange,
        setDateRange,
        reportData,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sendingEmail,
        generateReport,
        sendReportEmail
    }
}
