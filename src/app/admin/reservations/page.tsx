"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Search, Filter, Phone, Mail, MoreVertical, Check, X, RefreshCcw, User } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

// Helper para formatear fechas de forma nativa
const formatDate = (date: Date | string, pattern: string = "dd MMM") => {
    const d = new Date(date);
    if (pattern === "yyyy-MM-dd") {
        return d.toISOString().split('T')[0];
    }
    if (pattern === "dd/MM/yyyy") {
        return d.toLocaleDateString('es-ES');
    }
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

interface Reservation {
    id: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    reservation_date: string
    reservation_time: string
    guests_count: number
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    notes: string | null
    created_at: string
}

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Form state for new reservation
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        reservation_date: formatDate(new Date(), "yyyy-MM-dd"),
        reservation_time: "20:00",
        guests_count: 2,
        notes: ""
    })

    const fetchReservations = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('reservation_date', { ascending: true })
            .order('reservation_time', { ascending: true })

        if (error) {
            console.error("Error fetching reservations:", error)
        } else {
            setReservations(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchReservations()

        // Real-time subscription
        const channel = supabase.channel('reservations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchReservations)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
        const { error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)

        if (error) {
            alert("Error actualizando estado: " + error.message)
        } else {
            setSelectedReservation(null)
            fetchReservations()
        }
    }

    const handleCreateReservation = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase
            .from('reservations')
            .insert([{
                ...formData,
                status: 'confirmed'
            }])

        if (error) {
            alert("Error creando reserva: " + error.message)
        } else {
            setIsCreateModalOpen(false)
            setFormData({
                customer_name: "",
                customer_phone: "",
                customer_email: "",
                reservation_date: formatDate(new Date(), "yyyy-MM-dd"),
                reservation_time: "20:00",
                guests_count: 2,
                notes: ""
            })
            fetchReservations()
        }
    }

    const filteredReservations = useMemo(() => {
        return reservations.filter(r => 
            r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customer_phone.includes(searchTerm)
        )
    }, [reservations, searchTerm])

    const statusCounts = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        today: reservations.filter(r => r.reservation_date === formatDate(new Date(), "yyyy-MM-dd")).length
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1400px] mx-auto min-h-screen">
            {/* Header Pro */}
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
                            <p className="text-2xl font-black italic text-primary">{statusCounts.today}</p>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[100px] text-center">
                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Pendientes</p>
                            <p className="text-2xl font-black italic text-yellow-500">{statusCounts.pending}</p>
                        </div>
                    </div>

                    <div className="h-10 w-[1px] bg-white/10 hidden xl:block mx-2" />

                    <Button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" /> Nueva Reserva
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[1.5rem] p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/30 font-bold transition-all text-sm"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-full px-8 rounded-[1.5rem] border-white/10 bg-[#1A1A1A] font-bold gap-2">
                    <Filter className="w-4 h-4" /> Filtrar
                </Button>
                <Button onClick={fetchReservations} variant="outline" className="h-full px-5 rounded-[1.5rem] border-white/10 bg-[#1A1A1A]">
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
                </Button>
            </div>

            {/* Content Table / List */}
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
                            {filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Calendar className="w-16 h-16" />
                                            <p className="font-black italic uppercase tracking-tighter text-xl">No hay reservas registradas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map((res, i) => (
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
                                                    <p className="font-black uppercase italic text-lg tracking-tight group-hover:text-primary transition-colors">{res.customer_name}</p>
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
                                                <span className="text-xl font-black italic tracking-tighter">{res.reservation_time.substring(0, 5)}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xl font-black italic">{res.guests_count}</span>
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
                                            <div className="flex justify-end gap-2">
                                                {res.status === 'pending' && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(res.id, 'confirmed')} className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black shadow-lg shadow-green-500/5">
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedReservation(res)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5">
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

            {/* Create Reservation Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
                        >
                            <form onSubmit={handleCreateReservation}>
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Nueva <span className="text-primary">Reserva</span></h2>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl"><X /></button>
                                </div>
                                <div className="p-8 space-y-6">
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
                                    <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase italic text-xl bg-primary text-black hover:bg-primary/80 shadow-[0_0_30px_rgba(255,184,0,0.1)]">Confirmar Reserva</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedReservation && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Detalles de <span className="text-primary">Reserva</span></h2>
                                <button onClick={() => setSelectedReservation(null)} className="p-3 hover:bg-white/5 rounded-2xl"><X /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black italic text-2xl">
                                        {selectedReservation.customer_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic">{selectedReservation.customer_name}</h3>
                                        <p className="text-sm font-bold text-muted-foreground">{selectedReservation.customer_phone}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Día</p>
                                        <p className="font-black italic text-lg">{formatDate(selectedReservation.reservation_date, "dd/MM/yyyy")}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hora</p>
                                        <p className="font-black italic text-lg text-primary">{selectedReservation.reservation_time.substring(0, 5)}</p>
                                    </div>
                                </div>

                                {selectedReservation.notes && (
                                    <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 space-y-1">
                                        <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Observaciones</p>
                                        <p className="text-sm font-bold leading-relaxed opacity-80">{selectedReservation.notes}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 bg-black/40 border-t border-white/5 grid grid-cols-2 gap-4">
                                {selectedReservation.status !== 'cancelled' && (
                                    <Button onClick={() => handleUpdateStatus(selectedReservation.id, 'cancelled')} variant="ghost" className="h-14 rounded-2xl font-black uppercase italic text-xs text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white">Cancelar</Button>
                                )}
                                {selectedReservation.status !== 'completed' && (
                                    <Button onClick={() => handleUpdateStatus(selectedReservation.id, 'completed')} className="h-14 rounded-2xl font-black uppercase italic text-xs bg-white/10 hover:bg-white/20">Marcar Finalizado</Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
