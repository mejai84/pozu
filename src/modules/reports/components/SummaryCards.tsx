import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react"
import { ReportData } from "../types"

interface Props {
    reportData: ReportData
}

export const SummaryCards = ({ reportData }: Props) => {
    return (
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
    )
}
