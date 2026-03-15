import { motion, AnimatePresence } from "framer-motion"
import { X, Timer, User, Phone, Printer, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Order, BusinessInfo } from "../types"
import { printOrderTicket } from "@/lib/utils/print-ticket"

interface Props {
    order: Order | null
    onClose: () => void
    updateStatus: (id: string, status: string) => void
    minutes: number
    businessInfo: BusinessInfo
}

export const KDSModal = ({ order, onClose, updateStatus, minutes, businessInfo }: Props) => {
    if (!order) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 50 }} 
                    className="bg-[#0D0D0D] border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
                >
                    {/* Modal Header con Brillo dinámico */}
                    <div className={`p-10 flex justify-between items-center relative overflow-hidden ${order.status === 'preparing' ? 'bg-orange-500 text-black' : 'bg-[#151515] text-white border-b border-white/5'}`}>
                        {order.status === 'preparing' && <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse" />}
                        <div className="relative z-10">
                            <h2 className="text-6xl font-black italic tracking-tighter">ID #{order.id.split('-')[0].toUpperCase()}</h2>
                            <div className="flex items-center gap-6 mt-4 text-xl font-black italic uppercase tracking-widest opacity-80">
                                <div className="flex items-center gap-2"><Timer className="w-6 h-6" /> {minutes} MIN</div>
                                <div>•</div>
                                <div className="flex items-center gap-2">{order.status === 'preparing' ? '🔥 ACTIVADO' : '🧊 EN COLA'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="h-20 w-20 rounded-3xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all relative z-10 border border-black/5">
                            <X className="w-10 h-10" />
                        </button>
                    </div>

                    {/* Huge Items List */}
                    <div className="p-12 flex-1 overflow-y-auto no-scrollbar space-y-12">
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground opacity-30 block text-center">Detalle Comanda</label>
                            <div className="grid gap-4">
                                {order.order_items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-8 p-8 bg-white/5 rounded-[2rem] border border-white/5">
                                        <span className={`text-6xl font-black px-8 py-4 rounded-3xl min-w-[6rem] text-center shadow-2xl ${order.status === 'preparing' ? 'bg-orange-400 text-black' : 'bg-white/10 text-white'}`}>
                                            {item.quantity}
                                        </span>
                                        <div className="space-y-2">
                                            <p className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                                                {item.products?.name || "Especialidad Pozu"}
                                            </p>
                                            {item.customizations?.notes && (
                                                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-3">
                                                    <p className="text-primary text-xl font-black italic uppercase tracking-wider">
                                                        → {item.customizations.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {item.customizations && Object.entries(item.customizations).map(([k, v]) => (k !== 'notes' && v) ? (
                                                <span key={k} className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-black uppercase italic rounded-md border border-red-500/20 mr-2">SIN {k}</span>
                                            ) : null)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Identidad del Cliente</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><User className="w-6 h-6" /></div>
                                    <p className="text-2xl font-black italic uppercase tracking-tight">{order.guest_info?.name || "Cliente P"}</p>
                                </div>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Canal de Contacto</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Phone className="w-6 h-6" /></div>
                                    <p className="text-2xl font-black italic tracking-tight font-mono">{order.guest_info?.phone || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Heavy Action Bar */}
                    <div className="p-10 border-t border-white/5 flex gap-6 bg-black">
                        <Button variant="ghost" onClick={() => printOrderTicket(order, businessInfo)} className="h-24 px-10 border border-white/10 hover:bg-white/5 gap-3">
                            <Printer className="w-8 h-8 text-primary" />
                        </Button>
                        <Button variant="ghost" onClick={onClose} className="h-24 flex-1 text-2xl font-black uppercase italic tracking-widest hover:bg-white/5 rounded-[1.5rem] border border-white/5">VOLVER</Button>
                        {order.status === 'confirmed' ? (
                            <Button onClick={() => updateStatus(order.id, 'preparing')} className="h-24 flex-[2] text-4xl font-black italic uppercase tracking-tighter bg-orange-500 text-black hover:bg-orange-600 rounded-[1.5rem] shadow-2xl shadow-orange-500/20 gap-4">
                                MARCHAR COMANDA <Zap className="w-8 h-8" />
                            </Button>
                        ) : (
                            <Button onClick={() => updateStatus(order.id, 'ready')} className="h-24 flex-[2] text-4xl font-black italic uppercase tracking-tighter bg-green-600 text-black hover:bg-green-500 rounded-[1.5rem] shadow-2xl shadow-green-500/20 gap-4">
                                DESPACHAR YA <Check className="w-8 h-8" />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
