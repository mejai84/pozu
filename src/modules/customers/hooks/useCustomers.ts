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
            // 1. Fetch CRM Metadata (Notes) - Silently fail if not exists
            try {
                const { data: settingsData } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'crm_metadata')
                    .maybeSingle()
                
                if (settingsData?.value) {
                    setCrmMetadata(settingsData.value as any)
                }
            } catch (e) {
                console.warn('CRM Metadata not found, using empty object');
            }

            // 2. Fetch Orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (orders && orders.length > 0) {
                const customerMap = new Map<string, Customer>()

                orders.forEach(order => {
                    // Normalizar datos de cliente (Traductor Maestro)
                    const gInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info || '{}') : (order.guest_info || {});
                    const name = order.customer_name || gInfo?.full_name || gInfo?.name || "Desconocido";
                    
                    const phone = order.customer_phone || gInfo?.phone || "Sin teléfono";
                    const email = gInfo?.email || order.email;
                    
                    // Extraer dirección si existe
                    const addrInfo = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address || '{}') : (order.delivery_address || {});
                    let address = order.address || undefined;
                    if (!address && addrInfo?.street) {
                        address = `${addrInfo.street}${addrInfo.city ? ', ' + addrInfo.city : ''}`;
                    }

                    const key = (phone && phone !== "Sin teléfono") ? phone : `${name}-${order.created_at}`;

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
                            isRisk: false,
                            address
                        })
                    }

                    const customer = customerMap.get(key)!
                    if (name !== 'Desconocido' && (customer.name === 'Desconocido' || !customer.name)) customer.name = name
                    if (email && !customer.email) customer.email = email
                    if (address && !customer.address) customer.address = address
                    
                    customer.totalOrders += 1
                    customer.totalSpent += (order.total || 0)
                    customer.orders.push(order)
                    
                    if (new Date(order.created_at) > new Date(customer.lastOrder)) {
                        customer.lastOrder = order.created_at
                    }
                })

                // Convertir mapa a array y calcular puntos básicos
                const customerList = Array.from(customerMap.values()).map(c => ({
                    ...c,
                    points: Math.floor(c.totalSpent / 10)
                }));

                setCustomers(customerList);

                // 3. Intento asíncrono de riesgo (sin bloquear la lista principal)
                try {
                    const finalWithRisk = await Promise.all(customerList.map(async (c) => {
                        if (!c.phone || c.phone === 'Sin teléfono') return c;
                        
                        const { data: riskData } = await supabase.rpc('check_order_risk', { p_phone: c.phone });
                        const riskLevel = riskData?.[0]?.risk_level || 'AMARILLO';

                        return {
                            ...c,
                            isRisk: riskLevel === 'ROJO',
                            riskLevel: riskLevel as any
                        }
                    }))
                    setCustomers(finalWithRisk)
                } catch (riskErr) {
                    console.warn('Error en check_order_risk RPC:', riskErr);
                }
            } else {
                setCustomers([]);
            }
        } catch (err) {
            console.error('Error crítico en fetchCustomers:', err)
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
