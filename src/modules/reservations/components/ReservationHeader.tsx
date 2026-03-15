import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    todayCount: number
    pendingCount: number
    onOpenCreate: () => void
}

export const ReservationHeader = ({ todayCount, pendingCount, onOpenCreate }: Props) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#1A1A1A] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-50" />
            
            <div className="space-y-1 relative z-10">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    Libro de <span className="text-primary">Reservas</span>
                </h1>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Control de sala y flujo de comensales</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto relative z-10">
                <div className="flex gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[100px] text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Hoy</p>
                        <p className="text-2xl font-black italic text-primary">{todayCount}</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[100px] text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Pendientes</p>
                        <p className="text-2xl font-black italic text-yellow-500">{pendingCount}</p>
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10 hidden xl:block mx-2" />

                <Button 
                    onClick={onOpenCreate} 
                    className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" /> Nueva Reserva
                </Button>
            </div>
        </div>
    )
}
