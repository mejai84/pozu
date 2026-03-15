"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Package,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type OrderItem = {
  quantity: number
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
  delivery_address: any
  guest_info: any
  payment_method: string
  payment_status: string
  order_items: OrderItem[]
}

export default function DeliveryAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeliveryOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            products (
              name
            )
          )
        `)
        .in('status', ['ready', 'out_for_delivery'])
        .eq('order_type', 'delivery')
        .order('created_at', { ascending: true })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching delivery orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveryOrders()
    
    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('delivery_monitor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchDeliveryOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchDeliveryOrders()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'LISTO PARA REPARTO'
      case 'out_for_delivery': return 'EN CAMINO'
      default: return status.toUpperCase()
    }
  }

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <header className="glass rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
        
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary rounded-3xl shadow-xl shadow-primary/20">
            <Bike className="w-10 h-10 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Módulo de <span className="text-primary">Reparto</span>
            </h1>
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Control de entregas en tiempo real</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Pendientes</p>
            <p className="text-2xl font-black italic text-primary">{orders.length}</p>
          </div>
        </div>
      </header>

      {/* List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-[2.5rem] p-20 text-center space-y-4 border-dashed">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest opacity-40">No hay pedidos listos para envío ahora mismo</p>
          </div>
        ) : (
          <AnimatePresence>
            {orders.map((order, idx) => {
              const guestInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
              const address = typeof order.delivery_address === 'string' 
                ? order.delivery_address 
                : (order.delivery_address?.street || order.delivery_address?.address || "Sin dirección");
              
              const isCash = order.payment_method === 'cash';
              const isOut = order.status === 'out_for_delivery';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "glass rounded-[2rem] p-8 border-l-8 transition-all relative overflow-hidden",
                    isOut ? "border-l-purple-500 bg-purple-500/5" : "border-l-primary"
                  )}
                >
                  <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-primary">#{order.id.split('-')[0]}</h2>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                            <Clock className="w-4 h-4" />
                            Listo desde hace {Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)} min
                          </div>
                        </div>
                        <div className={cn(
                          "px-4 py-1 rounded-full text-[10px] font-black tracking-widest border",
                          isOut ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <MapPin className="w-6 h-6 text-primary mt-1" />
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Dirección de Entrega</p>
                              <p className="font-bold text-lg leading-tight">{address}</p>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-2 hover:underline"
                              >
                                Ver en Mapa <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Phone className="w-6 h-6 text-secondary" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Contacto</p>
                                <p className="font-bold text-lg">{order.customer_phone || guestInfo?.phone || "Sin teléfono"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                           <div className={cn(
                             "p-6 rounded-[2rem] border relative overflow-hidden h-full flex flex-col justify-center",
                             isCash ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                           )}>
                              <p className="text-[10px] font-black uppercase opacity-60 mb-2">{isCash ? "COBRAR EN EFECTIVO" : "PAGO CONFIRMADO ONLINE"}</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black italic tracking-tighter">{order.total.toFixed(2)}€</span>
                                {isCash && <DollarSign className="w-6 h-6 text-amber-500" />}
                              </div>
                              {isCash && (
                                <p className="text-xs font-bold text-amber-500/80 mt-2 italic">* Asegúrese de recibir el importe exacto</p>
                              )}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="xl:w-64 flex flex-col gap-4 justify-center border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-8">
                       {order.status === 'ready' && (
                         <Button 
                           onClick={() => updateStatus(order.id, 'out_for_delivery')}
                           className="h-20 rounded-3xl bg-primary text-black font-black uppercase italic tracking-tighter text-xl hover:bg-primary/80"
                         >
                           Iniciar Reparto <Bike className="ml-2 w-6 h-6" />
                         </Button>
                       )}
                       
                       <Button 
                         onClick={() => updateStatus(order.id, 'delivered')}
                         className={cn(
                           "h-20 rounded-3xl font-black uppercase italic tracking-tighter text-xl transition-all",
                           isOut 
                             ? "bg-purple-600 text-white hover:bg-purple-700" 
                             : "bg-white/5 text-muted-foreground hover:bg-white/10"
                         )}
                       >
                         Entregado <CheckCircle2 className="ml-2 w-6 h-6" />
                       </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <style jsx global>{`
        .glass {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
