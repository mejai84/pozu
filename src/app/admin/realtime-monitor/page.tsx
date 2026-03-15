"use client"

import { useEffect, useState, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  Zap, 
  Package, 
  Clock, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShoppingBag, 
  User, 
  Phone, 
  Bike,
  Printer,
  X,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { printOrderTicket } from '@/lib/utils/print-ticket'
import { settingsService, BusinessInfo } from '@/lib/supabase/settings'

// Types for our orders
type OrderItem = {
  quantity: number
  unit_price: number
  notes: string | null
  products: {
    name: string
  } | null
}

type Order = {
  id: string
  status: string
  total: number
  created_at: string
  order_type: string
  customer_phone: string | null
  delivery_zone: string | null
  estimated_arrival: string | null
  guest_info: any
  is_paid: boolean
  source: string | null
  order_items: OrderItem[]
  risk_level?: 'VERDE' | 'AMARILLO' | 'ROJO'
}

export default function AdminRealtimeMonitor() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [isPrinting, setIsPrinting] = useState<string | null>(null)
  const printedOrdersRef = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cashAudioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            notes,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      let newOrders = data || []
      
      // Enriquecer órdenes con el nivel de riesgo
      const ordersWithRisk = await Promise.all(newOrders.map(async (order) => {
        const guestInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
        const phone = order.customer_phone || guestInfo?.phone;
        
        if (phone) {
          const { data: riskData } = await supabase.rpc('check_order_risk', { p_phone: phone });
          return { ...order, risk_level: riskData?.[0]?.risk_level || 'AMARILLO' };
        }
        return { ...order, risk_level: 'AMARILLO' };
      }));

      setOrders(ordersWithRisk as Order[])
      setLastUpdate(new Date())

      // Lógica de Impresión Inteligente
      if (isFirstLoad.current) {
        // En la primera carga, marcamos todos los confirmados actuales como "ya impresos"
        // así evitamos que al entrar al monitor se imprima todo el historial de golpe.
        newOrders.forEach(o => {
          if (o.status === 'confirmed') printedOrdersRef.current.add(o.id)
        })
        isFirstLoad.current = false
      } else {
        // Solo auto-imprimimos si es una actualización posterior (un pedido nuevo o aceptado)
        const mostRecentOrder = newOrders[0]
        if (mostRecentOrder && 
            mostRecentOrder.status === 'confirmed' && 
            !printedOrdersRef.current.has(mostRecentOrder.id)) {
          
          console.log("Auto-printing new confirmed order:", mostRecentOrder.id)
          handlePrint(mostRecentOrder)
          printedOrdersRef.current.add(mostRecentOrder.id)
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    
    // Cargar info del negocio para los tickets
    settingsService.getBusinessInfo().then(setBusinessInfo)

    // Subscribe to Realtime changes
    const channel = supabase
      .channel('realtime_orders_monitor')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Realtime change received!', payload)
          
          if (isNotificationsEnabled) {
            const newOrder = payload.new as Order
            
            // Lógica de Impresión Inteligente Omnicanal
            const isConfirmedNow = newOrder.status === 'confirmed'
            const wasConfirmedBefore = (payload.old as Order)?.status === 'confirmed'

            if (isConfirmedNow && !wasConfirmedBefore && !printedOrdersRef.current.has(newOrder.id)) {
              console.log("Omnichannel Auto-Print Triggered:", newOrder.id)
              // Necesitamos los items para imprimir, así que fetchOrders los traerá 
              // En el próximo render, el useEffect de auto-impresión lo cogera 
              // o podemos forzarlo aquí si queremos más velocidad.
            }

            // Sonidos
            if (payload.eventType === 'INSERT') {
              audioRef.current?.play().catch(e => console.warn('Audio play failed', e))
            } else if (payload.eventType === 'UPDATE') {
              const oldOrder = payload.old as Order
              const wasPaid = oldOrder.status === 'paid' || (oldOrder as any).is_paid
              const isPaidNow = newOrder.status === 'paid' || (newOrder as any).is_paid
              
              if (isPaidNow && !wasPaid) {
                cashAudioRef.current?.play().catch(e => console.warn('Cash audio play failed', e))
              }
            }
          }
          
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isNotificationsEnabled])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      
      // Actualización inmediata para feedback rápido
      fetchOrders()
    } catch (err) {
      console.error('Error updating status:', err)
      alert("Error al actualizar el pedido. ¿Has aplicado las políticas SQL?")
    }
  }

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
      default: return status.toUpperCase()
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
    const elapsed = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000)
    if (elapsed < 1) return 'Recién llegado'
    return `Hace ${elapsed} min`
  }
  
  const handlePrint = async (order: Order) => {
    try {
      setIsPrinting(order.id)
      await printOrderTicket(order, businessInfo || {
        business_name: "Pozu 2.0",
        address: "Pola de Laviana",
        phone: "600000000",
        email: "pozu@example.com",
        is_open: true
      })
    } catch (error) {
      console.error("Error al imprimir:", error)
    } finally {
      setIsPrinting(null)
    }
  }

  return (
    <div className="min-h-full flex flex-col gap-8 pb-20">
      {/* Audio elements for notifications */}
      <audio ref={audioRef} src="/sounds/notification.wav" preload="auto" />
      <audio ref={cashAudioRef} src="/sounds/cash-register.wav" preload="auto" />

      {/* Header section with glassmorphism */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-[60px] -z-10" />
        
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              Monitor <span className="text-primary italic">Realtime</span>
            </h1>
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sincronizado vía Supabase • Actualizado {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-6 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
            className={cn(
              "rounded-2xl h-14 px-6 border-white/10 transition-all gap-2",
              isNotificationsEnabled ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5"
            )}
          >
            <Bell className={cn("w-5 h-5", isNotificationsEnabled && "animate-bounce")} />
            {isNotificationsEnabled ? "Alertas ON" : "Alertas OFF"}
          </Button>
          <Button 
            onClick={fetchOrders}
            variant="outline"
            className="rounded-2xl h-14 w-14 p-0 border-white/10 bg-white/5 hover:bg-white/10"
          >
            <Clock className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Grid of orders */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => {
              const guestInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
              const customerName = guestInfo?.name || guestInfo?.full_name || "Cliente";
              const customerPhone = order.customer_phone || guestInfo?.phone || "Sin teléfono";
              const isPaid = order.status === 'paid' || order.is_paid;

              return (
                <motion.div
                  key={order.id}
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
                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-primary">#{order.id.split('-')[0]}</h2>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {getTimeElapsed(order.created_at)}
                        <span className={cn(
                          "ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                          order.source === 'whatsapp' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          order.source === 'instagram' ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {order.source || 'web'}
                        </span>
                        {isPaid && (
                          <span className="ml-2 flex items-center gap-1 text-[8px] font-black uppercase text-green-500 tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse">
                            PAGADO 💰
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>

                    {/* Badge de Reputación / Anti-Fraude */}
                    <div className={cn(
                      "absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[8px] font-black flex items-center gap-1 shadow-lg border",
                      order.risk_level === 'ROJO' ? "bg-red-600 text-white border-red-400 animate-pulse" :
                      order.risk_level === 'VERDE' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {order.risk_level === 'ROJO' ? <ShieldAlert className="w-3 h-3" /> : 
                       order.risk_level === 'VERDE' ? <ShieldCheck className="w-3 h-3" /> : 
                       <ShieldQuestion className="w-3 h-3" />}
                      {order.risk_level === 'ROJO' ? 'LISTA NEGRA / RIESGO' : 
                       order.risk_level === 'VERDE' ? 'CLIENTE FIABLE' : 'CLIENTE NUEVO'}
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
                          <span className="font-bold text-xs">{(item.unit_price * item.quantity).toFixed(2)}€</span>
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
                          <span className="text-3xl font-black italic tracking-tighter text-white">{order.total.toFixed(2)}€</span>
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
                            isPrinting === order.id && "animate-pulse origin-center"
                          )}
                          onClick={() => handlePrint(order)}
                          disabled={isPrinting === order.id}
                        >
                          <Printer className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex-1 h-12 rounded-xl bg-amber-500 text-black font-black uppercase italic tracking-tighter hover:bg-amber-400 transition-all"
                        >
                          Aceptar Pedido
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 h-12 rounded-xl bg-emerald-500 text-black font-black uppercase italic tracking-tighter hover:bg-emerald-400 transition-all border-none"
                        >
                          Marchar Pedido
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="flex-1 h-12 rounded-xl bg-blue-500 text-white font-black uppercase italic tracking-tighter hover:bg-blue-600 transition-all border-none"
                        >
                          Listo / Reparto
                        </Button>
                      )}
                      {(order.status === 'ready' || order.status === 'out_for_delivery' || order.status === 'pending') && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex-1 h-12 rounded-xl bg-white/10 text-white font-black uppercase italic tracking-tighter hover:bg-white/20 transition-all"
                        >
                          Entregado
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <style jsx global>{`
        .glass {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
