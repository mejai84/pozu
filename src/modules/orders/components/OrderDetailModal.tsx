import { motion } from "framer-motion"
import { X, ShoppingBag, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Order } from "../types"
import { printOrderTicket } from "@/lib/utils/print-ticket"

interface Props {
    order: Order | null
    onClose: () => void
    onUpdateStatus: (id: string, status: string) => Promise<boolean>
    businessInfo: any
}

export const OrderDetailModal = ({ order, onClose, onUpdateStatus, businessInfo }: Props) => {
    if (!order) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl"><ShoppingBag className="w-6 h-6 text-primary" /></div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">ID #{order.id.split('-')[0].toUpperCase()}</h2>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{order.order_type} • {order.payment_method}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><X /></button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Composición del Pedido</h3>
                        <div className="space-y-2">
                            {order.order_items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-black italic text-primary">{item.quantity}x</span>
                                        <div className="flex flex-col">
                                            <span className="font-bold uppercase text-sm tracking-tight">{item.products?.name || item.customizations?.name || "Especial"}</span>
                                            {item.customizations?.notes && (
                                                <span className="text-[10px] text-primary font-black italic uppercase tracking-widest mt-0.5 transform -skew-x-12">
                                                    → {item.customizations.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-black italic">{(item.unit_price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Cliente</p>
                            <p className="font-extrabold uppercase italic tracking-tighter text-lg">{order.guest_info?.name || "Sin identificar"}</p>
                        </div>
                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Contacto</p>
                            <p className="font-extrabold text-sm">{order.guest_info?.phone || "N/A"}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                        <span className="font-black italic text-muted-foreground">INVERSIÓN TOTAL</span>
                        <span className="text-4xl font-black italic text-primary">{order.total?.toFixed(2) || "0.00"}€</span>
                    </div>
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                    <Button variant="ghost" onClick={() => printOrderTicket(order, businessInfo)} className="h-16 px-6 rounded-2xl border border-white/10 hover:bg-white/5 gap-2">
                        <Printer className="w-5 h-5" /> Ticket
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-16 rounded-2xl font-black uppercase italic text-xs">Cerrar</Button>
                    {['pending', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                        <Button 
                            onClick={() => {
                                const nextStatus: any = { 'pending': 'preparing', 'preparing': 'ready', 'ready': 'delivered', 'out_for_delivery': 'delivered' }
                                onUpdateStatus(order.id, nextStatus[order.status])
                                onClose()
                            }}
                            className="flex-[2] h-16 rounded-2xl font-black uppercase italic bg-primary text-black hover:bg-primary/80"
                        >
                            {order.status === 'pending' ? 'Enviar a Cocina' : order.status === 'preparing' ? 'Marcar como Listo' : 'Finalizar Pedido'}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
