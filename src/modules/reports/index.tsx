"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useReports } from './hooks/useReports'
import { ReportsHeader } from './components/ReportsHeader'
import { DateSelector } from './components/DateSelector'
import { SummaryCards } from './components/SummaryCards'
import { ReportsCharts } from './components/ReportsCharts'
import { EmailModal } from './components/EmailModal'

export const ReportsModule = () => {
    const {
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
    } = useReports()

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

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

    const exportToPDF = () => {
        window.print()
    }

    return (
        <div className="space-y-10 pb-10 relative">
            <ReportsHeader 
                reportData={reportData} 
                onEmailClick={() => setIsEmailModalOpen(true)}
                onExportCSV={exportToCSV}
                onExportPDF={exportToPDF}
            />

            <DateSelector 
                dateRange={dateRange}
                setDateRange={setDateRange}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onGenerate={generateReport}
            />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : reportData ? (
                <>
                    <SummaryCards reportData={reportData} />
                    <ReportsCharts reportData={reportData} />
                </>
            ) : (
                <div className="text-center py-20 text-muted-foreground bg-[#1A1A1A] border border-white/10 rounded-[2rem]">
                    Selecciona un período para generar el reporte
                </div>
            )}

            {isEmailModalOpen && (
                <EmailModal 
                    onClose={() => setIsEmailModalOpen(false)}
                    onSend={sendReportEmail}
                    isSending={sendingEmail}
                />
            )}
        </div>
    )
}
