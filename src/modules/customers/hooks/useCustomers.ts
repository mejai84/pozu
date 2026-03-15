import { useState, useEffect, useMemo } from 'react'
import { supabase } from "@/lib/supabase/client"
import { Customer, CRMMetadata } from '../types'

export const useCustomers = (searchTerm: string, filterType: string) => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [crmMetadata, setCrmMetadata] = useState<CRMMetadata>({})
    const [savingNotes, setSavingNotes] = useState(false)

    const fetchCustomersAndMetadata = async () => {
        setLoading(true)
        try {
            // 1. Fetch CRM Metadata (Notes)
            const { data: settingsData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'crm_metadata')
                .single()
            
            if (settingsData?.value) {
                setCrmMetadata(settingsData.value as any)
            }

            // 2. Fetch Orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (orders) {
                const customerMap = new Map<string, Customer>()
                const now = new Date()

                orders.forEach(order => {
                    const name = order.guest_info?.name || "Desconocido"
                    const phone = order.guest_info?.phone || "Sin teléfono"
                    const email = order.guest_info?.email
                    const key = phone !== "Sin teléfono" ? phone : `${name}-${order.created_at}`

                    if (!customerMap.has(key)) {
                        customerMap.set(key, {
                            name,
                            phone,
                            email,
                            totalOrders: 0,
                            totalSpent: 0,
                            lastOrder: order.created_at,
                            orders: [],
                            points: 0,
                            isRisk: false
                        })
                    }

                    const customer = customerMap.get(key)!
                    if (name !== 'Desconocido' && customer.name === 'Desconocido') customer.name = name
                    if (email && !customer.email) customer.email = email
                    
                    customer.totalOrders += 1
                    customer.totalSpent += (order.total || 0)
                    customer.orders.push(order)
                    
                    if (new Date(order.created_at) > new Date(customer.lastOrder)) {
                        customer.lastOrder = order.created_at
                    }
                })

                // Calcular puntos y riesgo real
                const finalCustomers = await Promise.all(Array.from(customerMap.values()).map(async (c) => {
                    // Consultar reputación real en Supabase
                    const { data: riskData } = await supabase.rpc('check_order_risk', { p_phone: c.phone })
                    const riskLevel = riskData?.[0]?.risk_level || 'AMARILLO'

                    return {
                        ...c,
                        points: Math.floor(c.totalSpent / 10),
                        isRisk: riskLevel === 'ROJO',
                        riskLevel: riskLevel as any
                    }
                }))

                setCustomers(finalCustomers)
            }
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCustomersAndMetadata()
    }, [])

    const processedCustomers = useMemo(() => {
        let filtered = customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filterType === 'vip') filtered = filtered.filter(c => c.totalSpent > 150)
        else if (filterType === 'loyal') filtered = filtered.filter(c => c.totalOrders >= 5)
        else if (filterType === 'new') filtered = filtered.filter(c => c.totalOrders === 1)
        else if (filterType === 'risk') filtered = filtered.filter(c => c.isRisk)

        return filtered.sort((a, b) => b.totalSpent - a.totalSpent)
    }, [customers, searchTerm, filterType])

    const handleSaveNotes = async (phone: string, notes: string) => {
        setSavingNotes(true)
        try {
            const newMetadata = {
                ...crmMetadata,
                [phone]: {
                    ...crmMetadata[phone],
                    notes: notes
                }
            }

            const { error } = await supabase
                .from('settings')
                .upsert({ 
                    key: 'crm_metadata', 
                    value: newMetadata,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setCrmMetadata(newMetadata)
            return true
        } catch (err) {
            console.error(err)
            return false
        } finally {
            setSavingNotes(false)
        }
    }

    const handleDeleteCustomer = async (phone: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ guest_info: { name: 'Borrado', phone: '0000', email: '' } })
            .eq('guest_info->>phone', phone)
        
        if (!error) {
            await fetchCustomersAndMetadata()
            return true
        }
        return false
    }

    return {
        customers: processedCustomers,
        loading,
        crmMetadata,
        savingNotes,
        handleSaveNotes,
        handleDeleteCustomer,
        refresh: fetchCustomersAndMetadata
    }
}
