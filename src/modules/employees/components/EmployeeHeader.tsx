import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    onOpenCreate: () => void
}

export const EmployeeHeader = ({ onOpenCreate }: Props) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1A1A] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary opacity-50" />
            
            <div className="space-y-1 relative z-10">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    Gestión de <span className="text-primary">Personal</span>
                </h1>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Control operativo y niveles de acceso</p>
            </div>

            <Button
                onClick={onOpenCreate}
                className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80 shadow-lg shadow-primary/20 relative z-10"
            >
                <UserPlus className="w-5 h-5" /> Nuevo Empleado
            </Button>
        </div>
    )
}
