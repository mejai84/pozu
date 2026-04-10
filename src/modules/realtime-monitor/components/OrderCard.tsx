import { motion } from 'framer-motion'
import { Clock, Phone, Bike, ShoppingBag, Printer, Package, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Order } from '../types'
import { RiskBadge } from './RiskBadge'

interface Props {
  order: Order
  index: number
  isPrinting: boolean
  onPrint: () => void
  onUpdateStatus: (id: string, status: string) => void
}

export const OrderCard = ({ order, index, isPrinting, onPrint, onUpdateStatus }: Props) => {
  const guestInfo = typeof order.guest_info === 'string' ? (() => { try { return JSON.parse(order.guest_info || '{}'); } catch(e) { return {}; } })() : (order.guest_info || {});
  const customerName = order.customer_name || guestInfo?.full_name || guestInfo?.name || "Cliente";
  const customerPhone = order.customer_phone || guestInfo?.phone || "Sin teléfono";
  const isPaid = order.status === 'paid' || order.is_paid;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'ready': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'out_for_delivery': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'delivered': return 'bg-white/5 text-muted-foreground border-white/10'
      case 'paid': return 'bg-green-600 text-white border-green-700'
      default: return 'bg-white/5 text-muted-foreground border-white/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDIENTE'
      case 'confirmed': return 'EN COCINA'
      case 'preparing': return 'PREPARANDO'
      case 'ready': return 'LISTO / PARA REPARTO'
      case 'out_for_delivery': return 'EN REPARTO'
      case 'delivered': return 'ENTREGADO'
      case 'paid': return 'PAGADO'
      default: return (status || '').toUpperCase()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />
      case 'confirmed': return <Package className="w-3.5 h-3.5 animate-bounce" />
      case 'preparing': return <Zap className="w-3.5 h-3.5 animate-pulse" />
      case 'ready': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'paid': return <Zap className="w-3.5 h-3.5" />
      default: return <AlertCircle className="w-3.5 h-3.5" />
    }
  }

  const getTimeElapsed = (createdAt: string) => {
    if (!createdAt) return '—'
    const elapsed = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000)
    if (elapsed < 1) return 'Recién llegado'
    return `Hace ${elapsed} min`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -50 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "glass rounded-[2rem] p-6 border-l-4 transition-all hover:scale-[1.02] cursor-default flex flex-col gap-6 overflow-hidden relative",
        order.status === 'pending' ? "border-l-amber-500" : 
        order.status === 'preparing' ? "border-l-blue-500" :
        order.status === 'ready' ? "border-l-green-500" : 
        isPaid ? "border-l-green-600 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]" : "border-l-white/10"
      )}
    >
      {isPaid && (
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-green-500/20 blur-2xl rounded-full" />
      )}

      {/* Card Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">PEDIDO</span>
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-primary">#{order.id?.split('-')[0] || '???'}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground flex-wrap">
            <Clock className="w-4 h-4" />
            {getTimeElapsed(order.created_at)}
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
              order.source === 'whatsapp' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
              order.source === 'instagram' ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" :
              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            )}>
              {order.source || 'web'}
            </span>
            
            <RiskBadge level={order.risk_level} />

            {isPaid && (
              <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-500 tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse">
                PAGADO 💰
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0",
          getStatusColor(order.status)
        )}>
          {getStatusIcon(order.status)}
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 bg-white/5 rounded-2xl grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Cliente</p>
          <p className="font-extrabold uppercase italic truncate">{customerName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Contacto</p>
          <p className="font-extrabold flex items-center gap-1">
            <Phone className="w-3 h-3 text-primary" />
            {customerPhone}
          </p>
        </div>
        {order.order_type === 'delivery' && (
           <div className="col-span-2 space-y-1 pt-2 border-t border-white/5">
            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Tipo / Envío</p>
            <p className="font-extrabold flex items-center gap-2 text-xs">
              <Bike className="w-4 h-4 text-secondary" />
              DOMICILIO {order.estimated_arrival && `• Llega aprox: ${new Date(order.estimated_arrival).toLocaleTimeString()}`}
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-3 flex-1">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
          <ShoppingBag className="w-3 h-3 text-primary" /> ARTÍCULOS ({order.order_items?.length || 0})
        </p>
        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-2">
          {order.order_items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm border-b border-white/5 pb-2 last:border-0">
              <div className="flex gap-2">
                <span className="font-black italic text-primary">{item.quantity}x</span>
                <div className="flex flex-col">
                  <span className="font-bold uppercase leading-tight line-clamp-1">{item.products?.name || "Producto"}</span>
                  {item.notes && (
                    <span className="text-[10px] text-muted-foreground italic">— {item.notes}</span>
                  )}
                </div>
              </div>
              <span className="font-bold text-xs">{( (item.unit_price || 0) * (item.quantity || 1) ).toFixed(2)}€</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Total facturado</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black italic tracking-tighter text-white">{(order.total || 0).toFixed(2)}€</span>
              {isPaid && (
                <div className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-0.5 rounded border border-green-500/20 uppercase">Pagado</div>
              )}
            </div>
          </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-xl border border-white/5 hover:bg-white/10",
                isPrinting && "animate-pulse origin-center"
              )}
              onClick={onPrint}
              disabled={isPrinting}
            >
              <Printer className="w-5 h-5" />
            </Button>
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button 
              onClick={() => onUpdateStatus(order.id, 'confirmed')}
              className="flex-1 h-12 rounded-xl bg-amber-500 text-black font-black uppercase italic tracking-tighter hover:bg-amber-400 transition-all"
            >
              Aceptar Pedido
            </Button>
          )}
          {order.status === 'confirmed' && (
            <Button 
              onClick={() => onUpdateStatus(order.id, 'preparing')}
              className="flex-1 h-12 rounded-xl bg-emerald-500 text-black font-black uppercase italic tracking-tighter hover:bg-emerald-400 transition-all border-none"
            >
              Marchar Pedido
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button 
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="flex-1 h-12 rounded-xl bg-blue-500 text-white font-black uppercase italic tracking-tighter hover:bg-blue-600 transition-all border-none"
            >
              Listo / Reparto
            </Button>
          )}
          {(order.status === 'ready' || order.status === 'out_for_delivery' || order.status === 'pending') && (
            <Button 
              onClick={() => onUpdateStatus(order.id, 'delivered')}
              className="flex-1 h-12 rounded-xl bg-white/10 text-white font-black uppercase italic tracking-tighter hover:bg-white/20 transition-all"
            >
              Entregado
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
