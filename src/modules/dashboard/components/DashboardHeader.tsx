import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

interface Props {
    onRefresh: () => void
}

export const DashboardHeader = ({ onRefresh }: Props) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#E8E0D5]">Dashboard <span className="text-primary">Pro</span></h1>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-mono text-white/70 backdrop-blur-md border border-white/10 shadow-sm">v2.0</span>
                </div>
                <p className="text-muted-foreground font-medium max-w-xl">
                    Centro de mando central. Control total sobre ventas en línea, pagos, reservas y analítica en tiempo real de Pozu.
                </p>
            </div>
            <Button onClick={onRefresh} className="relative z-10 gap-2 font-black uppercase tracking-tighter italic h-12 px-6 rounded-2xl shadow-[0_0_20px_rgba(255,184,0,0.2)] hover:shadow-[0_0_30px_rgba(255,184,0,0.3)] transition-all">
                <TrendingUp className="w-5 h-5" /> Sincronizar Datos
            </Button>
        </div>
    )
}
