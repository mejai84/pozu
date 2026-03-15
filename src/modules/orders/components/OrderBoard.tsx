import { motion } from "framer-motion"
import { AlertCircle, ChefHat, Bike, CheckCircle2, ShoppingBag, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Order } from "../types"

interface Props {
    orders: Order[]
    onView: (order: Order) => void
}

const getElapsed = (dateString: string) => {
    const start = new Date(dateString).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 60000)
    if (diff < 1) return "Ahora"
    if (diff < 60) return `${diff}m`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m`
}

export const OrderBoard = ({ orders, onView }: Props) => {
    const groups = {
        pending: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready' || o.status === 'out_for_delivery'),
        completed: orders.filter(o => o.status === 'delivered' || o.status === 'cancelled')
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full items-start">
            <OrderColumn title="Nuevas" icon={AlertCircle} color="text-blue-500" badgeColor="bg-blue-500/20 text-blue-500" orders={groups.pending} onView={onView} />
            <OrderColumn title="Cocina" icon={ChefHat} color="text-yellow-500" badgeColor="bg-yellow-500/20 text-yellow-500" orders={groups.preparing} onView={onView} />
            <OrderColumn title="Listos" icon={Bike} color="text-purple-500" badgeColor="bg-purple-500/20 text-purple-500" orders={groups.ready} onView={onView} />
            <OrderColumn title="Historial" icon={CheckCircle2} color="text-green-500" badgeColor="bg-green-500/20 text-green-500" orders={groups.completed.slice(0, 15)} onView={onView} isHistory />
        </div>
    )
}

function OrderColumn({ title, icon: Icon, color, badgeColor, orders, onView, isHistory = false }: any) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${badgeColor}`}><Icon className="w-4 h-4" /></div>
                    <span className="font-black italic uppercase text-sm tracking-tighter">{title}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-black border border-white/5 ${color}`}>{orders.length}</span>
            </div>

            <div className="space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)] pb-20">
                {orders.map((o: any, i: number) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                        key={o.id} 
                        onClick={() => onView(o)}
                        className={`group relative bg-[#1A1A1A] border ${isHistory ? 'border-white/5 opacity-60' : 'border-white/10'} rounded-3xl p-5 cursor-pointer hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 active:scale-95`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-lg italic uppercase tracking-tighter group-hover:text-primary transition-colors">#{o.id.split('-')[0].toUpperCase()}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{o.guest_info?.name || "Cliente P"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-[10px] font-black italic bg-white/5 px-2 py-0.5 rounded text-primary">{getElapsed(o.created_at)}</div>
                                {o.payment_method === 'stripe' && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex flex-1 items-center gap-1 opacity-40">
                                {o.order_type === 'delivery' ? <Bike className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                <span className="text-[9px] font-black uppercase tracking-widest">{o.order_type}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black/30 rounded-md border border-white/5">{o.order_items?.length || 0} ITEMS</span>
                        </div>

                        <div className="flex justify-between items-end pt-4 border-t border-white/5">
                            <div className="text-xl font-black italic tracking-tighter">{o.total?.toFixed(1) || "0.0"}€</div>
                            <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase italic bg-primary/10 text-primary border border-primary/20">Expandir</Button>
                        </div>
                    </motion.div>
                ))}
                {orders.length === 0 && (
                    <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Desierto</p>
                    </div>
                )}
            </div>
        </div>
    )
}
