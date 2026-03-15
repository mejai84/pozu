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
import { ReportData } from "../types"

interface Props {
    reportData: ReportData
}

export const ReportsCharts = ({ reportData }: Props) => {
    return (
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
    )
}
