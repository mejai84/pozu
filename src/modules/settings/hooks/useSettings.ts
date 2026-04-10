import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Settings, WeekHours, PrinterConfig } from '../types'

const defaultSettings: Settings = {
    business_name: "Pozu 2.0",
    phone: "+34 600 000 000",
    email: "info@pozu.com",
    address: "Calle Principal, 123",
    delivery_fee: 2.50,
    min_order_amount: 10.00,
    is_open: true,
    enable_combos: false,
    reservations_enabled: true,
    online_payments_enabled: true,
    cash_payments_enabled: true,
    tracking_enabled: true,
    takeaway_enabled: true,
    delivery_enabled: true,
    delivery_signature_enabled: true,
    maintenance_mode: false,
    taxes_enabled: true,
    tax_percentage: 10,
    printers: [],
    stripe_public_key: "",
    stripe_secret_key: ""
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [message, setMessage] = useState("")
    
    const [businessHours, setBusinessHours] = useState<WeekHours>({
        monday: { open: "12:00", close: "23:00", closed: false },
        tuesday: { open: "12:00", close: "23:00", closed: false },
        wednesday: { open: "12:00", close: "23:00", closed: false },
        thursday: { open: "12:00", close: "23:00", closed: false },
        friday: { open: "12:00", close: "23:00", closed: false },
        saturday: { open: "12:00", close: "23:00", closed: false },
        sunday: { open: "12:00", close: "23:00", closed: false },
    })

    const showMessage = (msg: string) => {
        setMessage(msg)
        setTimeout(() => setMessage(""), 3000)
    }

    const loadSettings = async () => {
        try {
            setInitialLoading(true)
            
            const { data: allSettings } = await supabase.from('settings').select('*')
            
            if (allSettings) {
                const mapped: Partial<Settings> = {}
                
                allSettings.forEach(item => {
                    if (item.key === 'business_info') {
                        Object.assign(mapped, item.value)
                    } else if (item.key === 'business_hours') {
                        setBusinessHours(item.value as WeekHours)
                    } else if (item.key === 'delivery_settings') {
                        Object.assign(mapped, item.value)
                    } else if (item.key === 'feature_flags') {
                        Object.assign(mapped, item.value)
                    } else if (item.key === 'printers_config') {
                        mapped.printers = item.value as PrinterConfig[]
                    } else if (item.key === 'stripe_keys') {
                        mapped.stripe_public_key = item.value.public_key || ""
                        mapped.stripe_secret_key = item.value.secret_key || ""
                    }
                })
                
                setSettings(prev => ({ ...prev, ...mapped }))
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    const saveByKey = async (key: string, value: any, successMsg: string) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ key, value }, { onConflict: 'key' })

            if (error) throw error
            showMessage(successMsg)
            return { success: true }
        } catch (error) {
            console.error(`Error saving ${key}:`, error)
            showMessage("✗ Error al guardar")
            return { success: false, error }
        } finally {
            setLoading(false)
        }
    }

    const handleSaveGeneral = () => saveByKey('business_info', {
        business_name: settings.business_name,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        is_open: settings.is_open
    }, "✓ Configuración guardada")

    const handleSaveHours = () => saveByKey('business_hours', businessHours, "✓ Horarios guardados")

    const handleSaveDelivery = () => saveByKey('delivery_settings', {
        delivery_fee: settings.delivery_fee,
        min_order_amount: settings.min_order_amount,
        taxes_enabled: settings.taxes_enabled,
        tax_percentage: settings.tax_percentage
    }, "✓ Delivery y Finanzas configurados")

    const handleSaveFeatures = () => saveByKey('feature_flags', {
        enable_combos: settings.enable_combos,
        reservations_enabled: settings.reservations_enabled,
        online_payments_enabled: settings.online_payments_enabled,
        cash_payments_enabled: settings.cash_payments_enabled,
        tracking_enabled: settings.tracking_enabled,
        takeaway_enabled: settings.takeaway_enabled,
        delivery_enabled: settings.delivery_enabled,
        delivery_signature_enabled: settings.delivery_signature_enabled,
        maintenance_mode: settings.maintenance_mode
    }, "✓ Funcionalidades actualizadas")

    const handleSavePrinters = () => saveByKey('printers_config', settings.printers, "✓ Hardware vinculado")

    const handleSaveStripe = () => saveByKey('stripe_keys', {
        public_key: settings.stripe_public_key,
        secret_key: settings.stripe_secret_key
    }, "✓ Claves de Stripe guardadas")

    return {
        settings, setSettings,
        businessHours, setBusinessHours,
        loading, initialLoading, message,
        handleSaveGeneral,
        handleSaveHours,
        handleSaveDelivery,
        handleSaveFeatures,
        handleSavePrinters,
        handleSaveStripe
    }
}
