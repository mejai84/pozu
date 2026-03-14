"use client"

import { Navbar } from "@/components/store/navbar";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ReservarPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        reservation_date: "",
        reservation_time: "20:00",
        guests_count: 2,
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('reservations')
            .insert([{
                ...formData,
                status: 'pending'
            }]);

        if (error) {
            alert("Error al enviar reserva: " + error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6 text-center">
                <Navbar />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#1A1A1A] border-2 border-primary/20 rounded-[3rem] p-12 space-y-6"
                >
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase italic text-[#E8E0D5]">¡Reserva Enviada!</h1>
                    <p className="text-muted-foreground font-medium">Hemos recibido tu solicitud. Te confirmaremos por teléfono en breve. ¡Prepárate para la experiencia Smash!</p>
                    <Button onClick={() => window.location.href = '/'} className="w-full h-14 rounded-2xl font-black uppercase italic bg-primary text-black">Volver al Inicio</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111] flex flex-col relative overflow-hidden">
            <Navbar />
            
            <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 relative z-10 size-full max-w-7xl mx-auto">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl space-y-12"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-[#E8E0D5]">
                            Reserva tu <span className="text-primary italic neon-text-glow">Mesa</span>
                        </h1>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                            Asegura tu sitio en el templo del sabor de Pola de Laviana.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Nombre Completo</label>
                                <input 
                                    required 
                                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner" 
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.customer_name}
                                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Teléfono de Contacto</label>
                                <input 
                                    required 
                                    type="tel"
                                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner" 
                                    placeholder="+34 600 000 000"
                                    value={formData.customer_phone}
                                    onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                                    <input 
                                        required 
                                        type="date"
                                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 pl-12 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner [color-scheme:dark]" 
                                        value={formData.reservation_date}
                                        onChange={e => setFormData({...formData, reservation_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Hora</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                                    <input 
                                        required 
                                        type="time"
                                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 pl-12 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner [color-scheme:dark]" 
                                        value={formData.reservation_time}
                                        onChange={e => setFormData({...formData, reservation_time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Número de Comensales</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                                <select 
                                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 pl-12 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner appearance-none"
                                    value={formData.guests_count}
                                    onChange={e => setFormData({...formData, guests_count: parseInt(e.target.value)})}
                                >
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <option key={n} value={n} className="bg-[#1A1A1A]">{n} Personas</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">¿Alguna nota o alergia?</label>
                            <textarea 
                                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white transition-all shadow-inner min-h-[100px]" 
                                placeholder="Indícanos si necesitas trona o tienes alguna intolerancia..."
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-20 rounded-[2rem] font-black uppercase italic text-xl bg-primary text-black hover:bg-primary/80 shadow-[0_15px_30px_rgba(234,179,8,0.2)] transition-all active:scale-[0.98] group"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <span className="flex items-center gap-3">
                                    Confirmar Reserva <Check className="w-6 h-6" />
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                            Te contactaremos para confirmar la disponibilidad.
                        </p>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
