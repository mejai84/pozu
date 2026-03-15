import Link from "next/link"
import { Eye, DollarSign, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeeklyRevenueData } from "../types"

interface Props {
    weeklyRevenue: WeeklyRevenueData[]
    userRole: string | null
}

export const AnalyticalCharts = ({ weeklyRevenue, userRole }: Props) => {
    if (userRole !== 'admin' && userRole !== 'manager') return null

    return (
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

            {/* Pasarela y Pagos */}
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
                        <Link href='/admin/settings' className="w-full">
                            <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs bg-white/10 hover:bg-primary hover:text-black border border-white/10 transition-all">
                                Configurar Pasarelas
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
