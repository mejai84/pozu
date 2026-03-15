import Link from "next/link"
import { ArrowUp, ArrowDown, Loader2, LucideIcon } from "lucide-react"

interface Props {
    title: string
    value: string | number
    icon: LucideIcon
    trend: string
    trendUp: boolean
    loading: boolean
    subtitle?: string
    href?: string
    colorClass?: string
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, loading, subtitle, href = "#", colorClass = "from-primary/20 to-transparent" }: Props) => (
    <Link href={href} className="block h-full">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 shadow-lg hover:shadow-primary/10 group h-full flex flex-col justify-between cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${trendUp ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">{title}</h3>
                {loading ? (
                    <div className="h-10 flex items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic tracking-tighter text-[#E8E0D5]">{value}</span>
                        {subtitle && <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>}
                    </div>
                )}
            </div>
        </div>
    </Link>
)
