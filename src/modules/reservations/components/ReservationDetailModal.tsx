import { motion } from "framer-motion"
import { X, User, Phone, Mail, Calendar, Clock, Users, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reservation } from "../types"

interface Props {
    reservation: Reservation | null
    onClose: () => void
    onUpdateStatus: (id: string, status: Reservation['status']) => void
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const ReservationDetailModal = ({ reservation, onClose, onUpdateStatus }: Props) => {
    if (!reservation) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Detalles de <span className="text-primary">Reserva</span></h2>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-white"><X /></button>
                </div>

                <div className="p-8 space-y-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic text-4xl shadow-2xl shadow-primary/5">
                            {reservation.customer_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">{reservation.customer_name}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {reservation.customer_phone}</span>
                                {reservation.customer_email && <span className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {reservation.customer_email}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-2">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Fecha
                            </p>
                            <p className="font-black italic text-xl">{formatDate(reservation.reservation_date)}</p>
                        </div>
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-2">
                            <p className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Hora
                            </p>
                            <p className="font-black italic text-xl text-secondary">{reservation.reservation_time.substring(0, 5)}</p>
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Capacidad</p>
                            <p className="text-2xl font-black italic flex items-center gap-2">{reservation.guests_count} <span className="text-sm uppercase opacity-50 not-italic">Personas</span></p>
                        </div>
                        <Users className="w-10 h-10 text-primary opacity-20" />
                    </div>

                    {reservation.notes && (
                        <div className="p-6 bg-yellow-500/5 rounded-3xl border border-yellow-500/10 space-y-2">
                            <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> Preferencias / Alergias
                            </p>
                            <p className="text-sm font-bold leading-relaxed italic opacity-80">{reservation.notes}</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5 grid grid-cols-2 gap-4">
                    {reservation.status === 'pending' ? (
                        <Button 
                            onClick={() => { onUpdateStatus(reservation.id, 'confirmed'); onClose(); }}
                            className="col-span-2 h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-tighter hover:bg-primary/80"
                        >
                            Confirmar Reserva <CheckCircle className="ml-2 w-5 h-5" />
                        </Button>
                    ) : (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={() => { onUpdateStatus(reservation.id, 'cancelled'); onClose(); }}
                                className="h-14 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase italic text-xs"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Cancelar
                            </Button>
                            <Button 
                                onClick={() => { onUpdateStatus(reservation.id, 'completed'); onClose(); }}
                                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase italic text-xs border border-white/10"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Finalizar
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
