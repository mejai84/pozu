import { useState } from "react"
import { Bike, MapPin, Phone, Clock, ExternalLink, DollarSign, CheckCircle2, AlertTriangle, AlertCircle, Info, PenLine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DeliveryOrder, DeliveryIncident } from "../types"
import { DeliveryIncidentModal } from "./DeliveryIncidentModal"
import { DeliverySignatureModal } from "./DeliverySignatureModal"

interface Props {
    order: DeliveryOrder
    index: number
    signatureEnabled: boolean
    onUpdateStatus: (id: string, status: string, extra?: { signature_url?: string }) => void
    onReportIncident: (id: string, incident: DeliveryIncident) => void
}

export const DeliveryCard = ({ order, index, signatureEnabled, onUpdateStatus, onReportIncident }: Props) => {
    const [isIncidentOpen, setIsIncidentOpen] = useState(false)
    const [isSignatureOpen, setIsSignatureOpen] = useState(false)
    const [showFullItems, setShowFullItems] = useState(false)

    const guestInfo = order.guest_info
    const addressData = order.delivery_address
    const addressStr = typeof addressData === 'string' 
        ? addressData 
        : (addressData?.street || addressData?.address || "Sin dirección")
    
    const isCash = order.payment_method === 'cash'
    const isOut = order.status === 'out_for_delivery'
    const isDelivered = order.status === 'delivered'

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ready': return 'LISTO PARA SALIR'
            case 'out_for_delivery': return 'EN REPARTO'
            case 'delivered': return 'ENTREGADO'
            default: return status.toUpperCase()
        }
    }

    const elapsedMin = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "bg-[#1A1A1A]/80 backdrop-blur-2xl rounded-[2.5rem] border-l-8 transition-all relative overflow-hidden border border-white/10 group",
                isOut ? "border-l-purple-500 shadow-2xl shadow-purple-500/5" : isDelivered ? "border-l-emerald-500 opacity-60" : "border-l-primary shadow-2xl shadow-primary/5"
            )}
        >
            {/* Incident Overlay Badge */}
            {order.incidents && order.incidents.length > 0 && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{order.incidents.length} INCIDENCIAS</span>
                </div>
            )}

            <div className="p-8">
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px_250px] gap-8">
                    
                    {/* Column 1: Core Customer Info */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors">
                                    Pedido <span className="text-primary group-hover:text-white">#{order.id.split('-')[0]}</span>
                                </h2>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                        <Clock className="w-4 h-4" />
                                        Hace {elapsedMin} min
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-md text-[9px] font-black tracking-widest border",
                                        isOut ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : 
                                        isDelivered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-5 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group/card">
                                <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1 tracking-widest">Dirección de Entrega</p>
                                    <p className="font-extrabold text-lg leading-tight text-white mb-2">{addressStr}</p>
                                    {addressData?.notes && (
                                        <div className="flex items-start gap-2 p-2 bg-primary/5 border border-primary/20 rounded-xl mb-3">
                                            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-tighter leading-tight italic">{addressData.notes}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-black"
                                        >
                                            Abrir Navegador <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        {addressData?.coordinates && (
                                            <Button variant="ghost" className="h-[34px] bg-white/5 text-[10px] uppercase font-black px-4 rounded-xl border border-white/5">
                                                Visualizar Mapa
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-white/[0.03] rounded-3xl border border-white/5">
                                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20">
                                    <Phone className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-0.5 tracking-widest">Cliente: {guestInfo?.name || "Pozu User"}</p>
                                    <p className="font-black text-xl italic tracking-tighter text-white">{order.customer_phone || guestInfo?.phone || "Sin contacto"}</p>
                                </div>
                                <Button size="sm" className="ml-auto rounded-xl bg-secondary/20 text-secondary hover:bg-secondary hover:text-white h-10 px-4">Llamar</Button>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Order Items & Incidents */}
                    <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground opacity-50 tracking-widest mb-4 flex items-center justify-between">
                                Productos ({order.order_items?.length || 0})
                                <button onClick={() => setShowFullItems(!showFullItems)} className="text-primary hover:underline">{showFullItems ? 'Contraer' : 'Ver todo'}</button>
                            </h4>
                            <div className="space-y-2">
                                {(showFullItems ? order.order_items : order.order_items?.slice(0, 3)).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black italic text-primary">{item.quantity}x</span>
                                            <span className="font-bold text-white uppercase text-[11px] tracking-tight">{item.products?.name || "Producto"}</span>
                                        </div>
                                    </div>
                                ))}
                                {order.order_items?.length > 3 && !showFullItems && (
                                    <p className="text-[10px] font-bold text-muted-foreground italic">+ {order.order_items.length - 3} productos más...</p>
                                )}
                            </div>
                        </div>

                        {order.incidents && order.incidents.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Historial de Incidencias
                                </h4>
                                {order.incidents.map((incident, i) => (
                                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3">
                                        <div className="w-1 h-full bg-red-500 rounded-full" />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black uppercase text-red-400 group-hover:text-red-300">{incident.type.replace('_', ' ')}</p>
                                            <p className="text-[10px] font-medium text-white/70 leading-relaxed italic">{incident.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column 3: Payment & Actions */}
                    <div className="space-y-4 lg:border-l lg:border-white/5 lg:pl-8 flex flex-col justify-between h-full">
                        <div className={cn(
                            "p-6 rounded-3xl border relative overflow-hidden flex flex-col items-center justify-center text-center",
                            isCash ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                            <div className="absolute -top-4 -right-4 opacity-10">
                                <DollarSign className="w-24 h-24" />
                            </div>
                            <p className="text-[9px] font-black uppercase opacity-60 mb-2 tracking-widest">{isCash ? "COBRAR EN DESTINO" : "PAGADO ONLINE"}</p>
                            <div className="text-4xl font-black italic tracking-tighter text-white">{order.total.toFixed(2)}€</div>
                            {isCash && <p className="text-[9px] font-bold text-amber-500 mt-2 uppercase">* Importe exacto</p>}
                        </div>

                        <div className="space-y-2">
                            {order.status === 'ready' && (
                                <Button 
                                    onClick={() => onUpdateStatus(order.id, 'out_for_delivery')}
                                    className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-tighter hover:bg-primary/80 shadow-lg shadow-primary/20 text-sm"
                                >
                                    Iniciar Reparto <Bike className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                            
                            {isOut && (
                                <Button 
                                    onClick={() => signatureEnabled ? setIsSignatureOpen(true) : onUpdateStatus(order.id, 'delivered')}
                                    className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black uppercase italic tracking-tighter hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 text-sm gap-2"
                                >
                                    {signatureEnabled ? (
                                        <><PenLine className="w-5 h-5" /> Firma y Confirmar Entrega</>
                                    ) : (
                                        <><CheckCircle2 className="w-5 h-5" /> Confirmar Entrega</>
                                    )}
                                </Button>
                            )}

                            {!isDelivered && (
                                <Button 
                                    variant="outline"
                                    onClick={() => setIsIncidentOpen(true)}
                                    className="w-full h-12 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase italic text-[10px] tracking-widest"
                                >
                                    Reportar Problema <AlertTriangle className="ml-2 w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isIncidentOpen && (
                    <DeliveryIncidentModal 
                        order={order}
                        onClose={() => setIsIncidentOpen(false)}
                        onReport={onReportIncident}
                    />
                )}
                {isSignatureOpen && (
                    <DeliverySignatureModal
                        order={order}
                        onClose={() => setIsSignatureOpen(false)}
                        onConfirmDelivery={(signatureUrl) => {
                            onUpdateStatus(order.id, 'delivered', { signature_url: signatureUrl ?? undefined })
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
