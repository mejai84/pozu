"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Download,
    TrendingUp,
    Calendar,
    DollarSign,
    ShoppingBag,
    Users,
    Loader2,
    Filter,
    BarChart3,
    Mail,
    Send,
    X
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'
import { sendReportEmail } from "./actions"

interface ReportData {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
    topProducts: { name: string; sales: number; revenue: number }[]
    dailyRevenue: { date: string; revenue: number; orders: number }[]
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month')
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const [emailAddress, setEmailAddress] = useState('')
    const [sendingEmail, setSendingEmail] = useState(false)

    useEffect(() => {
        generateReport()
    }, [dateRange])

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

            // Fetch orders
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

                // Top products
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

                // Daily revenue
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

    const handleSendEmail = async () => {
        if (!emailAddress || !reportData) return

        setSendingEmail(true)
        try {
            const result = await sendReportEmail(emailAddress, reportData)
            if (result.success) {
                alert('Email enviado correctamente!')
                setIsEmailModalOpen(false)
            } else {
                alert('Error al enviar email: ' + result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error al enviar el email')
        } finally {
            setSendingEmail(false)
        }
    }

    const exportToCSV = () => {
        if (!reportData) return

        const csvContent = [
            ['Resumen del Reporte'],
            ['Ingresos Totales', `${reportData.totalRevenue.toFixed(2)}€`],
            ['Total de Pedidos', reportData.totalOrders],
            ['Total de Clientes', reportData.totalCustomers],
            ['Valor Promedio del Pedido', `${reportData.averageOrderValue.toFixed(2)}€`],
            [],
            ['Top Productos'],
            ['Producto', 'Ventas', 'Ingresos'],
            ...reportData.topProducts.map(p => [p.name, p.sales, `${p.revenue.toFixed(2)}€`]),
            [],
            ['Ingresos Diarios'],
            ['Fecha', 'Ingresos', 'Pedidos'],
            ...reportData.dailyRevenue.map(d => [d.date, `${d.revenue.toFixed(2)}€`, d.orders])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `reporte_pozu_${new Date().toISOString().split('T')[0]}.csv`)
        link.click()
    }

    const exportToPDF = async () => {
        window.print()
    }

    return (
        <div className="space-y-10 pb-10 relative">
            {/* Cabecera Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#E8E0D5]">Inteligencia de <span className="text-primary">Negocio</span></h1>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-xl">
                        Métricas avanzadas, rendimiento financiero y comportamiento de clientes para la toma de decisiones.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 relative z-10">
                    <Button
                        onClick={() => setIsEmailModalOpen(true)}
                        variant="outline"
                        disabled={!reportData}
                        className="gap-2 rounded-xl border-white/10 font-bold bg-white/5 hover:bg-white/10"
                    >
                        <Mail className="w-4 h-4" /> Exportar (Email)
                    </Button>
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        disabled={!reportData}
                        className="gap-2 rounded-xl border-white/10 font-bold bg-white/5 hover:bg-white/10"
                    >
                        <Download className="w-4 h-4" /> Descargar CSV
                    </Button>
                    <Button
                        onClick={exportToPDF}
                        disabled={!reportData}
                        className="gap-2 rounded-xl font-black uppercase tracking-tighter italic"
                    >
                        <FileText className="w-4 h-4" /> Imprimir PDF
                    </Button>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                    <div className="p-3 bg-white/5 rounded-xl text-primary">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Período de <span className="text-primary">Análisis</span></h3>
                        <p className="text-sm text-muted-foreground mt-1">Configura el rango temporal de tus métricas</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={dateRange === 'today' ? 'default' : 'outline'}
                        onClick={() => setDateRange('today')}
                        className={`rounded-xl font-bold ${dateRange === 'today' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                        Hoy
                    </Button>
                    <Button
                        variant={dateRange === 'week' ? 'default' : 'outline'}
                        onClick={() => setDateRange('week')}
                        className={`rounded-xl font-bold ${dateRange === 'week' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                        Última Semana
                    </Button>
                    <Button
                        variant={dateRange === 'month' ? 'default' : 'outline'}
                        onClick={() => setDateRange('month')}
                        className={`rounded-xl font-bold ${dateRange === 'month' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                        Último Mes
                    </Button>
                    <Button
                        variant={dateRange === 'custom' ? 'default' : 'outline'}
                        onClick={() => setDateRange('custom')}
                        className={`rounded-xl font-bold ${dateRange === 'custom' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                        Personalizado
                    </Button>
                </div>

                {dateRange === 'custom' && (
                    <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10"
                            />
                        </div>
                        <Button onClick={generateReport} className="self-end">
                            <Filter className="w-4 h-4 mr-2" /> Generar
                        </Button>
                    </div>
                )}
            </div>

            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-card border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                        <button
                            onClick={() => setIsEmailModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Enviar Reporte</h3>
                                <p className="text-sm text-muted-foreground">Envía este resumen por correo electrónico</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Dirección de Email</label>
                                <input
                                    type="email"
                                    placeholder="ejemplo@pozu.com"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsEmailModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 font-bold"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail || !emailAddress}
                                >
                                    {sendingEmail ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Reporte
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : reportData ? (
                <>
                    {/* Summary Cards Pro */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-green-500/20 transition-colors">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">Ingreso Bruto</h3>
                                <div className="text-4xl font-black italic tracking-tighter text-green-500">
                                    {reportData.totalRevenue.toFixed(2)}€
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                                    <ShoppingBag className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">Total Pedidos</h3>
                                <div className="text-4xl font-black italic tracking-tighter text-blue-500">
                                    {reportData.totalOrders}
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">Alcance (Clientes)</h3>
                                <div className="text-4xl font-black italic tracking-tighter text-purple-500">
                                    {reportData.totalCustomers}
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-orange-500/20 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">Ticket Promedio</h3>
                                <div className="text-4xl font-black italic tracking-tighter text-orange-500">
                                    {reportData.averageOrderValue.toFixed(2)}€
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Daily Revenue Chart */}
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 lg:col-span-2 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="mb-8 pb-6 border-b border-white/5 relative z-10">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Curva de <span className="text-primary">Facturación</span></h3>
                                <p className="text-sm text-muted-foreground mt-1">Comparativa temporal de ingresos (Bruto)</p>
                            </div>
                            <div className="h-[300px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportData.dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#666"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            tickFormatter={(value: string) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value: number) => `${value}€`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            labelStyle={{ color: '#888', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#eab308', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`${Number(value || 0).toFixed(2)}€`, 'Ingresos']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#eab308"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products Chart */}
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
                            <div className="mb-8 pb-6 border-b border-white/5">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Productos <span className="text-primary">Estrella</span></h3>
                                <p className="text-sm text-muted-foreground mt-1">Ranking de popularidad por ingresos</p>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={reportData.topProducts.slice(0, 5)} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={110}
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#ffffff08' }}
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`${Number(value || 0).toFixed(2)}€`, 'Ingresos']}
                                        />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Orders Volume Chart */}
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
                            <div className="mb-8 pb-6 border-b border-white/5">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Volumen de <span className="text-primary">Tráfico</span></h3>
                                <p className="text-sm text-muted-foreground mt-1">Cantidad de pedidos emitidos</p>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            tickFormatter={(value: string) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#ffffff08' }}
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                            itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                                            formatter={(value: any) => [value || 0, 'Pedidos']}
                                        />
                                        <Bar dataKey="orders" fill="#ec4899" radius={[8, 8, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    Selecciona un período para generar el reporte
                </div>
            )}
        </div>
    )
}
