import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Order } from '../types'
import { settingsService, BusinessInfo } from '@/lib/supabase/settings'
import { printOrderTicket } from '@/lib/utils/print-ticket'

export const useRealtimeOrders = (isNotificationsEnabled: boolean) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [isPrinting, setIsPrinting] = useState<string | null>(null)
  
  const printedOrdersRef = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cashAudioRef = useRef<HTMLAudioElement | null>(null)

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

  const fetchOrders = useCallback(async () => {
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
      const newOrders = (data || []).map(order => ({
          ...order,
          risk_level: 'AMARILLO' // Default behavior while we stabilize the backend
      }));
      
      setOrders(newOrders as Order[])
      setLastUpdate(new Date())

      if (isFirstLoad.current) {
        newOrders.forEach(o => {
          if (o.status === 'confirmed') printedOrdersRef.current.add(o.id)
        })
        isFirstLoad.current = false
      } else {
        const mostRecentOrder = newOrders[0] as Order
        if (mostRecentOrder && 
            mostRecentOrder.status === 'confirmed' && 
            !printedOrdersRef.current.has(mostRecentOrder.id)) {
          handlePrint(mostRecentOrder)
          printedOrdersRef.current.add(mostRecentOrder.id)
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [businessInfo])

  useEffect(() => {
    // Initialize audio elements
    audioRef.current = new Audio("/sounds/notification.wav")
    cashAudioRef.current = new Audio("/sounds/cash-register.wav")

    fetchOrders()
    settingsService.getBusinessInfo().then(setBusinessInfo)

    const channel = supabase
      .channel('realtime_orders_monitor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (isNotificationsEnabled) {
            const newOrder = payload.new as Order
            if (payload.eventType === 'INSERT') {
              audioRef.current?.play().catch(() => {})
            } else if (payload.eventType === 'UPDATE') {
              const oldOrder = payload.old as Order
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const wasPaid = oldOrder.status === 'paid' || (oldOrder as any).is_paid
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const isPaidNow = newOrder.status === 'paid' || (newOrder as any).is_paid
              if (isPaidNow && !wasPaid) {
                cashAudioRef.current?.play().catch(() => {})
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
  }, [isNotificationsEnabled, fetchOrders])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error
      fetchOrders()
    } catch (err) {
      console.error('Error updating status:', err)
      alert("Error al actualizar el pedido.")
    }
  }

  return {
    orders,
    loading,
    lastUpdate,
    isPrinting,
    updateOrderStatus,
    handlePrint,
    refresh: fetchOrders
  }
}
