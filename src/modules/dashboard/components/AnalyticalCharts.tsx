"use client"

import Link from "next/link"
import { Eye, DollarSign, TrendingUp, ShoppingBag, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeeklyRevenueData, TopProduct } from "../types"
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import { motion } from "framer-motion"

interface Props {
    weeklyRevenue: WeeklyRevenueData[]
    topProducts: TopProduct[]
    userRole: string | null
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <p className="text-xl font-black italic text-primary">
                    {payload[0].value.toFixed(2)}€
                </p>
            </div>
        )
    }
    return null
}

export const AnalyticalCharts = ({ weeklyRevenue, topProducts, userRole }: Props) => {
    if (userRole !== 'admin' && userRole !== 'manager') return null

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Interactive Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
                
                <div className="relative z-10 flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Curva de <span className="text-primary">Evolución</span></h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Rendimiento semanal de la flota</p>
                        </div>
                    </div>
                    <Link href="/admin/reports">
                        <Button variant="outline" size="sm" className="rounded-xl border-white/10 font-black uppercase tracking-widest text-[9px] h-10 px-6 bg-white/5 hover:bg-primary hover:text-black transition-all gap-2">
                            <Eye className="w-4 h-4" /> Análisis Deep
                        </Button>
                    </Link>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyRevenue}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }}
                                tickFormatter={(val) => `${val}€`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#eab308" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Top Products - Premium List */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative overflow-hidden"
            >
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -z-10" />
                
                <div className="mb-8 pb-6 border-b border-white/5 flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary fill-primary/20" />
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Top <span className="text-primary">Rockstars</span></h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Los favoritos de hoy</p>
                    </div>
                </div>

                <div className="flex-1 space-y-5">
                    {topProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                            <ShoppingBag className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase">Sin ventas aún</p>
                        </div>
                    ) : (
                        topProducts.map((product, idx) => (
                            <div key={idx} className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-primary/10 hover:border-primary/20 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-primary text-sm group-hover:scale-110 transition-transform">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black italic uppercase text-sm text-white group-hover:text-primary transition-colors">{product.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{product.sales} vendidos</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black italic text-lg text-primary">{product.revenue.toFixed(2)}€</p>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Zap className="w-3 h-3 text-primary fill-primary/20" />
                                        <span className="text-[8px] font-black text-muted-foreground uppercase">Hot</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-tighter italic text-sm bg-primary text-black hover:bg-primary/90 shadow-[0_10px_30px_rgba(234,179,8,0.2)]">
                        Ver Inventario Completo
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

