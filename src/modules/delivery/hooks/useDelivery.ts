import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DeliveryOrder, DeliveryIncident } from '../types'

export const useDelivery = () => {
    const [orders, setOrders] = useState<DeliveryOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [signatureEnabled, setSignatureEnabled] = useState(true)

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'feature_flags')
            .single()
        if (data?.value) {
            setSignatureEnabled(data.value.delivery_signature_enabled !== false)
        }
    }

    const fetchDeliveryOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        quantity,
                        products ( name )
                    )
                `)
                .in('status', ['ready', 'out_for_delivery', 'delivered']) // Incluimos delivered para histórico reciente si es necesario
                .eq('order_type', 'delivery')
                .order('created_at', { ascending: false })

            if (error) throw error
            // Filtrar para mostrar solo activos en la vista principal pero permitir historial
            setOrders(data || [])
        } catch (err) {
            console.error('Error fetching delivery orders:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeliveryOrders()
        fetchSettings()
        
        const channel = supabase
            .channel('delivery_monitor')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchDeliveryOrders()
                    fetchSettings()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const updateStatus = async (orderId: string, newStatus: string, extra?: { signature_url?: string }) => {
        try {
            const updates: any = { status: newStatus, ...extra }
            if (newStatus === 'delivered') {
                updates.delivered_at = new Date().toISOString()
            }
            
            const { error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId)

            if (error) throw error
            await fetchDeliveryOrders()
        } catch (err) {
            console.error('Error updating status:', err)
        }
    }

    const reportIncident = async (orderId: string, incident: DeliveryIncident) => {
        try {
            // Fetch current incidents
            const { data: order } = await supabase
                .from('orders')
                .select('incidents')
                .eq('id', orderId)
                .single()

            const currentIncidents = order?.incidents || []
            const updatedIncidents = [...currentIncidents, incident]

            const { error } = await supabase
                .from('orders')
                .update({ 
                    incidents: updatedIncidents,
                    status: 'ready' // Devolvemos a cocina si hay incidencia grave o marcar como especial
                })
                .eq('id', orderId)

            if (error) throw error
            await fetchDeliveryOrders()
        } catch (err) {
            console.error('Error reporting incident:', err)
        }
    }

    return {
        orders,
        loading,
        signatureEnabled,
        updateStatus,
        reportIncident,
        refresh: fetchDeliveryOrders
    }
}
