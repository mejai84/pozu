import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, RefreshCw } from "lucide-react"

interface Props {
    preparingCount: number
    confirmedCount: number
    isAlertEnabled: boolean
    onToggleAlert: () => void
    onRefresh: () => void
    loading: boolean
    lastFetch: Date
}

export const KDSHeader = ({ preparingCount, confirmedCount, isAlertEnabled, onToggleAlert, onRefresh, loading, lastFetch }: Props) => {
    return (
        <header className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 bg-[#111] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[100px] -z-10 rounded-full" />
            
            <div className="flex items-center gap-6 w-full lg:w-auto">
                <Link href="/admin/orders">
                    <Button variant="ghost" className="h-16 w-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        KDS <span className="text-orange-500">POZU</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">Cocina en tiempo real v2.0</p>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-end">
                <div className="flex gap-4">
                    <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                        <p className="text-[9px] font-black uppercase text-orange-500/60 mb-1">En Plancha</p>
                        <p className="text-3xl font-black italic">{preparingCount}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                        <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50 mb-1">En Cola</p>
                        <p className="text-3xl font-black italic">{confirmedCount}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={isAlertEnabled ? "default" : "outline"} 
                            size="icon" 
                            onClick={onToggleAlert} 
                            className={`h-12 w-12 rounded-xl border-white/10 ${isAlertEnabled ? 'bg-orange-500 text-black hover:bg-orange-600' : 'bg-transparent text-muted-foreground'}`}
                            title={isAlertEnabled ? "Sonido Activado" : "Sonido Desactivado"}
                        >
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onRefresh} className={`h-12 w-12 rounded-xl hover:bg-white/10 border border-white/10 ${loading ? "animate-spin text-orange-500" : "text-white"}`}>
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>
                    <span className="text-[8px] font-bold opacity-30 uppercase">{lastFetch.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                </div>
            </div>
        </header>
    )
}
