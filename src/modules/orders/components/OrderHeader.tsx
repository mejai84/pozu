import { Plus, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
    todayTotal: number
    activeCount: number
    onOpenCreate: () => void
}

export const OrderHeader = ({ todayTotal, activeCount, onOpenCreate }: Props) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#1A1A1A] border border-white/10 p-6 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
            
            <div className="space-y-1">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    Terminal <span className="text-primary">Comandas</span>
                </h1>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Gestión de flujo operativo en tiempo real</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[120px]">
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Hoy</p>
                        <p className="text-xl font-black italic text-primary">{todayTotal.toFixed(1)}€</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[120px]">
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">En Curso</p>
                        <p className="text-xl font-black italic text-secondary">{activeCount}</p>
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10 hidden xl:block" />

                <div className="flex gap-2">
                    <Button onClick={onOpenCreate} className="h-14 px-6 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80 shadow-lg shadow-primary/10">
                        <Plus className="w-5 h-5" /> Nueva Comanda
                    </Button>
                    <Link href="/admin/kitchen">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl font-black uppercase italic tracking-tighter gap-3 border-white/10 hover:bg-white/5">
                            <ChefHat className="w-5 h-5 text-primary" /> KDS
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
