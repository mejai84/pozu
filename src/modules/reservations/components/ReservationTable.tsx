import { motion } from "framer-motion"
import { Calendar, Phone, Users, MoreVertical, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reservation } from "../types"

interface Props {
    reservations: Reservation[]
    onUpdateStatus: (id: string, status: Reservation['status']) => void
    onViewDetail: (res: Reservation) => void
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export const ReservationTable = ({ reservations, onUpdateStatus, onViewDetail }: Props) => {
    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Fecha y Hora</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Pax</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reservations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Calendar className="w-16 h-16" />
                                        <p className="font-black italic uppercase tracking-tighter text-xl text-white">No hay reservas registradas</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            reservations.map((res, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={res.id} 
                                    className="group hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black uppercase italic tracking-tighter group-hover:scale-110 transition-transform">
                                                {res.customer_name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase italic text-lg tracking-tight group-hover:text-primary transition-colors text-white">{res.customer_name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3" /> {res.customer_phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="inline-flex flex-col p-3 bg-black/40 border border-white/5 rounded-2xl">
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">
                                                {formatDate(res.reservation_date)}
                                            </span>
                                            <span className="text-xl font-black italic tracking-tighter text-white">{res.reservation_time.substring(0, 5)}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xl font-black italic text-white">{res.guests_count}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            res.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                                            res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                                            res.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-white/5 text-muted-foreground border-white/10'
                                        }`}>
                                            {res.status === 'confirmed' ? 'Confirmada' : 
                                             res.status === 'pending' ? 'Pendiente' : 
                                             res.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 text-white">
                                            {res.status === 'pending' && (
                                                <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(res.id, 'confirmed')} className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black shadow-lg shadow-green-500/5">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => onViewDetail(res)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
