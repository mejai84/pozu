import { useState, useEffect, useMemo } from 'react'
import { supabase } from "@/lib/supabase/client"
import { Order, BusinessInfo } from '../types'

export const useKDS = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [lastFetch, setLastFetch] = useState<Date>(new Date())
    const [isAlertEnabled, setIsAlertEnabled] = useState(true)
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        business_name: "Pozu 2.0",
        address: "Pozu Restaurant",
        phone: "600 000 000"
    })

    const playAlertSound = () => {
        if (!isAlertEnabled) return
        try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(800, ctx.currentTime)
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
                gain.gain.setValueAtTime(0.5, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
                osc.start()
                osc.stop(ctx.currentTime + 0.5)
            })
        } catch (e) {}
    }

    const fetchOrders = async (currentOrders: Order[]) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    quantity,
                    customizations,
                    products (
                        name
                    )
                )
            `)
            .in('status', ['confirmed', 'preparing'])
            .order('created_at', { ascending: true })

        if (!error && data) {
            const currentIds = new Set(currentOrders.map(o => o.id))
            const newConfirmedOrders = data.filter(o => !currentIds.has(o.id))
            
            if (newConfirmedOrders.length > 0 && currentOrders.length > 0) {
                playAlertSound()
            }
            
            setOrders(data as any)
        }
        
        setLoading(false)
        setLastFetch(new Date())
    }

    const fetchSettings = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'business_info').single()
        if (data?.value) setBusinessInfo(data.value as any)
    }

    useEffect(() => {
        fetchOrders([])
        fetchSettings()
        const interval = setInterval(() => {
            setOrders(current => {
                fetchOrders(current)
                return current
            })
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    const updateStatus = async (id: string, newStatus: string) => {
        const previousOrders = [...orders]
        
        if (newStatus === 'ready') {
            setOrders(prev => prev.filter(o => o.id !== id))
        } else {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
        }

        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
        if (error) {
            console.error(error)
            setOrders(previousOrders)
        }
    }

    const counts = useMemo(() => ({
        preparing: orders.filter(o => o.status === 'preparing').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length
    }), [orders])

    return {
        orders,
        loading,
        lastFetch,
        isAlertEnabled,
        setIsAlertEnabled,
        businessInfo,
        updateStatus,
        fetchOrders: () => fetchOrders(orders),
        counts
    }
}
