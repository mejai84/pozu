import { motion } from "framer-motion"
import { Eye, User, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Order } from "../types"

interface Props {
    order: Order
    index: number
    onMarchar: () => void
    onListo: () => void
    onExpand: () => void
    minutes: number
}

export const KDSCard = ({ order, onMarchar, onListo, onExpand, minutes, index }: Props) => {
    const isPreparing = order.status === 'preparing'
    const isUrgent = minutes > 15 && !isPreparing

    // Normalizar datos de cliente
    const guestInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
    const customerName = order.customer_name || guestInfo?.full_name || guestInfo?.name || "C. Registrado";
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group flex flex-col rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 bg-[#0A0A0A] ${isPreparing ? 'border-orange-500 shadow-[0_0_50px_-15px_rgba(249,115,22,0.4)] scale-100 z-10' : isUrgent ? 'border-red-600 shadow-[0_0_40px_-15px_rgba(220,38,38,0.3)] animate-pulse' : 'border-white/10 grayscale-[0.5] hover:grayscale-0 hover:border-white/30'}`}
        >
            {/* Header Ticket */}
            <div className={`p-5 flex justify-between items-start transition-colors duration-500 ${isPreparing ? 'bg-orange-500 text-black' : isUrgent ? 'bg-red-600 text-white' : 'bg-white/5 text-white'}`}>
                <div>
                    <h3 className="text-2xl font-black italic tracking-tighter">#{order.id.split('-')[0].toUpperCase()}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPreparing ? 'bg-black/10' : 'bg-white/10'}`}>
                            {isPreparing ? 'EN PLANCHA 🔥' : isUrgent ? 'DEMORADO ⚠️' : 'EN COLA'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black italic tracking-tighter font-mono ${isPreparing ? 'text-black/80' : 'text-primary'}`}>{minutes}m</div>
                </div>
            </div>

            {/* Content Ticket */}
            <div className="p-6 flex-1 space-y-4">
                <div className="space-y-3 min-h-[140px]">
                    {order.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-4">
                            <span className={`text-xl font-black px-2 py-1 rounded-lg min-w-[2.2rem] text-center border-b-2 ${isPreparing ? 'bg-orange-500/20 text-orange-500 border-orange-500/40' : 'bg-white/10 text-white border-white/10'}`}>
                                {item.quantity}
                            </span>
                            <div className="space-y-0.5">
                                <p className="font-bold text-lg uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors">{item.products?.name || "Special"}</p>
                                {item.customizations?.notes && (
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 p-2 rounded mt-2 italic shadow-inner">
                                        → {item.customizations.notes}
                                    </p>
                                )}
                                {item.customizations && Object.entries(item.customizations).some(([k, v]) => k !== 'notes' && v) && (
                                    <p className="text-[9px] font-black text-red-500/80 uppercase tracking-widest mt-1">PERSONALIZADO</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-40">
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{customerName}</span>
                    </div>
                    <button onClick={onExpand} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ZoomIn className="w-4 h-4 text-muted-foreground hover:text-white" /></button>
                </div>
            </div>

            {/* Industrial Button Bar */}
            <div className="p-3 bg-white/5 gap-2 grid grid-cols-[auto_1fr]">
                <Button variant="ghost" onClick={onExpand} className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5">
                    <Eye className="w-6 h-6" />
                </Button>
                {isPreparing ? (
                    <Button onClick={onListo} className="h-14 text-lg font-black italic uppercase bg-green-600 text-black hover:bg-green-500 rounded-2xl shadow-xl shadow-green-600/10">DESPACHAR ✅</Button>
                ) : (
                    <Button onClick={onMarchar} className="h-14 text-lg font-black italic uppercase bg-orange-500 text-black hover:bg-orange-400 rounded-2xl shadow-xl shadow-orange-500/10">MARCHAR 🔥</Button>
                )}
            </div>
        </motion.div>
    )
}
