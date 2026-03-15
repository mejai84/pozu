import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReservationFormData } from "../types"

interface Props {
    onClose: () => void
    onSubmit: (data: ReservationFormData) => Promise<boolean>
}

const formatDate = (date: Date, pattern: string = "yyyy-MM-dd") => {
    const d = new Date(date);
    if (pattern === "yyyy-MM-dd") {
        return d.toISOString().split('T')[0];
    }
    return d.toLocaleDateString('es-ES');
}

export const ReservationFormModal = ({ onClose, onSubmit }: Props) => {
    const [formData, setFormData] = useState<ReservationFormData>({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        reservation_date: formatDate(new Date(), "yyyy-MM-dd"),
        reservation_time: "20:00",
        guests_count: 2,
        notes: ""
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const success = await onSubmit(formData)
        setLoading(false)
        if (success) onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Nueva <span className="text-primary">Reserva</span></h2>
                        <button type="button" onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-white"><X /></button>
                    </div>
                    <div className="p-8 space-y-6 text-white">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</label>
                                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fecha</label>
                                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none" value={formData.reservation_date} onChange={e => setFormData({...formData, reservation_date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hora</label>
                                    <input type="time" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none" value={formData.reservation_time} onChange={e => setFormData({...formData, reservation_time: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comensales</label>
                                <input type="number" min="1" max="20" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-primary" value={formData.guests_count} onChange={e => setFormData({...formData, guests_count: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notas / Alergias</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none min-h-[100px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-black/40 border-t border-white/5">
                        <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl font-black uppercase italic text-xl bg-primary text-black hover:bg-primary/80 shadow-[0_0_30px_rgba(255,184,0,0.1)]">
                            {loading ? "Creando..." : "Confirmar Reserva"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
