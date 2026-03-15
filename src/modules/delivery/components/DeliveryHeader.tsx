import { Bike } from "lucide-react"

interface Props {
    count: number
}

export const DeliveryHeader = ({ count }: Props) => {
    return (
        <header className="bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
            
            <div className="flex items-center gap-6">
                <div className="p-5 bg-primary rounded-3xl shadow-xl shadow-primary/20">
                    <Bike className="w-10 h-10 text-black" />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Módulo de <span className="text-primary">Reparto</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Control de entregas en tiempo real</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Pendientes</p>
                    <p className="text-2xl font-black italic text-primary">{count}</p>
                </div>
            </div>
        </header>
    )
}
