import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Order, Product } from '../types'
import { printOrderTicket } from '@/lib/utils/print-ticket'

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [businessInfo, setBusinessInfo] = useState({
        business_name: "Pozu 2.0",
        address: "Pozu Restaurant",
        phone: "600 000 000"
    })

    const fetchOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) console.error(error)
        else setOrders(data || [])
        setLoading(false)
    }

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*')
        setProducts(data || [])
    }

    const fetchSettings = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'business_info').single()
        if (data?.value) setBusinessInfo(data.value)
    }

    useEffect(() => {
        fetchOrders()
        fetchProducts()
        fetchSettings()
        const interval = setInterval(() => {
            setOrders(prev => [...prev])
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const createOrder = async (customerName: string, items: (Product & { quantity: number; notes?: string })[]) => {
        try {
            const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
            const orderData = {
                status: 'pending',
                order_type: 'pickup',
                total: total,
                subtotal: total,
                guest_info: { name: customerName || "Cliente Presencial", phone: "" },
                payment_method: 'cash',
                payment_status: 'pending'
            }
            const { data: order, error } = await supabase.from('orders').insert([orderData]).select().single()
            if (error) throw error
            
            const itemsToInsert = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                customizations: { notes: item.notes || "" }
            }))
            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)
            if (itemsError) throw itemsError
            
            // Auto print
            try {
                await printOrderTicket({
                    ...order,
                    order_items: items.map(i => ({ ...i, products: { name: i.name }, unit_price: i.price, customizations: { notes: i.notes } }))
                }, businessInfo)
            } catch (printErr) {
                console.warn("Print error:", printErr)
            }

            fetchOrders()
            return { success: true }
        } catch (e: any) { 
            console.error("Order creation error:", e)
            return { success: false, error: e.message }
        }
    }

    const updateOrderStatus = async (orderId: string, nextStatus: string) => {
        const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId)
        if (!error) fetchOrders()
        return !error
    }

    return {
        orders,
        products,
        loading,
        businessInfo,
        fetchOrders,
        createOrder,
        updateOrderStatus
    }
}
