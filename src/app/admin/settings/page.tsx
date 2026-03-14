
"use client"

import { Button } from "@/components/ui/button"
import { Instagram, Save, Upload, Store, Clock, MapPin, Phone, Mail, DollarSign, Truck, CheckCircle, Printer, Plus, Trash2, Wifi, HardDrive, Smartphone } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

interface Settings {
    business_name: string
    phone: string
    email: string
    address: string
    delivery_fee: number
    min_order_amount: number
    is_open: boolean
    enable_combos: boolean
    reservations_enabled: boolean
    printers: PrinterConfig[]
}

interface PrinterConfig {
    id: string
    name: string
    type: "cashier" | "kitchen" | "bar" | "other"
    connection: "usb" | "network" | "bluetooth"
    paper_size: "58mm" | "80mm"
    target_ip?: string
}

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
    printers: []
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [settings, setSettings] = useState<Settings>(defaultSettings)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [businessHours, setBusinessHours] = useState({
        monday: { open: "12:00", close: "23:00", closed: false },
        tuesday: { open: "12:00", close: "23:00", closed: false },
        wednesday: { open: "12:00", close: "23:00", closed: false },
        thursday: { open: "12:00", close: "23:00", closed: false },
        friday: { open: "12:00", close: "23:00", closed: false },
        saturday: { open: "12:00", close: "23:00", closed: false },
        sunday: { open: "12:00", close: "23:00", closed: false },
    })

    // Load settings from Supabase on mount
    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setInitialLoading(true)

            // Load business info
            const { data: businessData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'business_info')
                .single()

            if (businessData?.value) {
                const businessInfo = businessData.value as any
                setSettings(prev => ({
                    ...prev,
                    business_name: businessInfo.business_name || prev.business_name,
                    phone: businessInfo.phone || prev.phone,
                    email: businessInfo.email || prev.email,
                    address: businessInfo.address || prev.address,
                    is_open: businessInfo.is_open ?? prev.is_open
                }))
            }

            // Load business hours
            const { data: hoursData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'business_hours')
                .single()

            if (hoursData?.value) {
                setBusinessHours(hoursData.value as any)
            }

            // Load delivery settings
            const { data: deliveryData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'delivery_settings')
                .single()

            if (deliveryData?.value) {
                const deliverySettings = deliveryData.value as any
                setSettings(prev => ({
                    ...prev,
                    delivery_fee: deliverySettings.delivery_fee || prev.delivery_fee,
                    min_order_amount: deliverySettings.min_order_amount || prev.min_order_amount
                }))
            }

            // Load feature flags
            const { data: featuresData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'feature_flags')
                .single()

            if (featuresData?.value) {
                const features = featuresData.value as any
                setSettings(prev => ({
                    ...prev,
                    enable_combos: features.enable_combos ?? prev.enable_combos,
                    reservations_enabled: features.reservations_enabled ?? prev.reservations_enabled
                }))
            }

            // Load printers config
            const { data: printersData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'printers_config')
                .single()

            if (printersData?.value) {
                setSettings(prev => ({
                    ...prev,
                    printers: printersData.value as PrinterConfig[]
                }))
            }

        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    const showMessage = (msg: string) => {
        setMessage(msg)
        setTimeout(() => setMessage(""), 3000)
    }

    const handleSaveGeneral = async () => {
        setLoading(true)
        try {
            // Save business info
            const businessInfo = {
                business_name: settings.business_name,
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                is_open: settings.is_open
            }

            const { error } = await supabase
                .from('settings')
                .update({ value: businessInfo })
                .eq('key', 'business_info')

            if (error) throw error

            showMessage("✓ Configuración guardada correctamente")
        } catch (error) {
            console.error('Error saving settings:', error)
            showMessage("✗ Error al guardar la configuración")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveHours = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('settings')
                .update({ value: businessHours })
                .eq('key', 'business_hours')

            if (error) throw error

            showMessage("✓ Horarios guardados correctamente")
        } catch (error) {
            console.error('Error saving hours:', error)
            showMessage("✗ Error al guardar los horarios")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDelivery = async () => {
        setLoading(true)
        try {
            const deliverySettings = {
                delivery_fee: settings.delivery_fee,
                min_order_amount: settings.min_order_amount
            }

            const { error } = await supabase
                .from('settings')
                .update({ value: deliverySettings })
                .eq('key', 'delivery_settings')

            if (error) throw error

            showMessage("✓ Configuración de delivery guardada")
        } catch (error) {
            console.error('Error saving delivery settings:', error)
            showMessage("✗ Error al guardar la configuración de delivery")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveFeatures = async () => {
        setLoading(true)
        try {
            const features = {
                enable_combos: settings.enable_combos,
                reservations_enabled: settings.reservations_enabled
            }

            // Check if feature_flags exists
            const { data } = await supabase
                .from('settings')
                .select('key')
                .eq('key', 'feature_flags')
                .single()

            let error;

            if (data) {
                const result = await supabase
                    .from('settings')
                    .update({ value: features })
                    .eq('key', 'feature_flags')
                error = result.error
            } else {
                const result = await supabase
                    .from('settings')
                    .insert({ key: 'feature_flags', value: features })
                error = result.error
            }

            if (error) throw error

            showMessage("✓ Funcionalidades guardadas")
        } catch (error) {
            console.error('Error saving features:', error)
            showMessage("✗ Error al guardar funcionalidades")
        } finally {
            setLoading(false)
        }
    }

    const handleSavePrinters = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ 
                    key: 'printers_config', 
                    value: settings.printers 
                }, { onConflict: 'key' })

            if (error) throw error
            showMessage("✓ Configuración de impresoras guardada")
        } catch (error) {
            console.error('Error saving printers:', error)
            showMessage("✗ Error al guardar impresoras")
        } finally {
            setLoading(false)
        }
    }

    const addPrinterNode = () => {
        const newNode: PrinterConfig = {
            id: Date.now().toString(),
            name: "NUEVA IMPRESORA",
            type: "kitchen",
            connection: "network",
            paper_size: "80mm"
        }
        setSettings({
            ...settings,
            printers: [...settings.printers, newNode]
        })
    }

    const updatePrinterNode = (id: string, updates: Partial<PrinterConfig>) => {
        setSettings({
            ...settings,
            printers: settings.printers.map(p => p.id === id ? { ...p, ...updates } : p)
        })
    }

    const removePrinterNode = (id: string) => {
        setSettings({
            ...settings,
            printers: settings.printers.filter(p => p.id !== id)
        })
    }

    const toggleBusinessDay = (day: string) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: { ...prev[day as keyof typeof prev], closed: !prev[day as keyof typeof prev].closed }
        }))
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-muted-foreground">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">Gestiona los ajustes de tu negocio</p>
                </div>
                {message && (
                    <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg border border-green-500/20 font-medium animate-in fade-in slide-in-from-top-2">
                        {message}
                    </div>
                )}
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-white/10 mb-8 gap-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Store className="w-4 h-4 inline mr-2" />
                    General
                </button>
                <button
                    onClick={() => setActiveTab("hours")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'hours' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Horarios
                </button>
                <button
                    onClick={() => setActiveTab("delivery")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'delivery' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Truck className="w-4 h-4 inline mr-2" />
                    Delivery
                </button>
                <button
                    onClick={() => setActiveTab("features")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'features' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Funcionalidades
                </button>
                <button
                    onClick={() => setActiveTab("printers")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'printers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Printer className="w-4 h-4 inline mr-2" />
                    Impresoras
                </button>
                <button
                    onClick={() => setActiveTab("instagram")}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'instagram' ? 'border-pink-500 text-pink-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'general' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                                <Store className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Información del Negocio</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Store className="w-4 h-4 text-muted-foreground" />
                                        Nombre del Negocio
                                    </label>
                                    <input
                                        value={settings.business_name}
                                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        Teléfono de Contacto
                                    </label>
                                    <input
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        Email de Contacto
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        Dirección
                                    </label>
                                    <input
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                                <CheckCircle className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Estado del Negocio</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <div className="font-bold">Estado Actual</div>
                                        <div className="text-sm text-muted-foreground">Controla si aceptas pedidos</div>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, is_open: !settings.is_open })}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.is_open ? 'bg-green-500' : 'bg-red-500'}`}
                                    >
                                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.is_open ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className={`p-4 rounded-xl border ${settings.is_open ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className={`font-bold ${settings.is_open ? 'text-green-500' : 'text-red-500'}`}>
                                        {settings.is_open ? '🟢 Abierto - Aceptando Pedidos' : '🔴 Cerrado - No aceptando pedidos'}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {settings.is_open ? 'Los clientes pueden realizar pedidos' : 'Los clientes no pueden realizar pedidos'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <Button
                                onClick={handleSaveGeneral}
                                disabled={loading}
                                className="gap-2 bg-primary text-white font-bold px-8"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'hours' && (
                    <div className="bg-card border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 text-primary pb-4 border-b border-white/10 mb-6">
                            <Clock className="w-6 h-6" />
                            <div>
                                <h3 className="text-xl font-bold">Horario de Atención</h3>
                                <p className="text-sm text-muted-foreground">Configura los horarios de tu negocio</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(businessHours).map(([day, hours]) => (
                                <div key={day} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="w-32">
                                        <span className="font-bold capitalize">{day === 'monday' ? 'Lunes' : day === 'tuesday' ? 'Martes' : day === 'wednesday' ? 'Miércoles' : day === 'thursday' ? 'Jueves' : day === 'friday' ? 'Viernes' : day === 'saturday' ? 'Sábado' : 'Domingo'}</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-4">
                                        {!hours.closed ? (
                                            <>
                                                <input
                                                    type="time"
                                                    value={hours.open}
                                                    className="p-2 rounded bg-white/5 border border-white/10 font-mono"
                                                    onChange={(e) => setBusinessHours({
                                                        ...businessHours,
                                                        [day]: { ...hours, open: e.target.value }
                                                    })}
                                                />
                                                <span className="text-muted-foreground">a</span>
                                                <input
                                                    type="time"
                                                    value={hours.close}
                                                    className="p-2 rounded bg-white/5 border border-white/10 font-mono"
                                                    onChange={(e) => setBusinessHours({
                                                        ...businessHours,
                                                        [day]: { ...hours, close: e.target.value }
                                                    })}
                                                />
                                            </>
                                        ) : (
                                            <span className="text-red-500 font-medium">Cerrado</span>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleBusinessDay(day)}
                                        className={hours.closed ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}
                                    >
                                        {hours.closed ? 'Abrir' : 'Cerrar'}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={handleSaveHours}
                            disabled={loading}
                            className="gap-2 bg-primary text-white font-bold mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Guardar Horarios
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {activeTab === 'delivery' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                                <Truck className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Configuración de Delivery</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        Costo de Envío (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.50"
                                        value={settings.delivery_fee}
                                        onChange={(e) => setSettings({ ...settings, delivery_fee: parseFloat(e.target.value) })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        Pedido Mínimo (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="1.00"
                                        value={settings.min_order_amount}
                                        onChange={(e) => setSettings({ ...settings, min_order_amount: parseFloat(e.target.value) })}
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
                            <h4 className="font-bold text-lg mb-4">Vista Previa</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Subtotal</span>
                                    <span className="font-mono">15.00€</span>
                                </div>
                                <div className="flex justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Costo de Envío</span>
                                    <span className="font-mono text-primary font-bold">{settings.delivery_fee.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between p-3 bg-primary/20 rounded-lg border border-primary/30">
                                    <span className="font-bold">Total</span>
                                    <span className="font-mono font-bold">{(15 + settings.delivery_fee).toFixed(2)}€</span>
                                </div>
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs">
                                    💡 Pedido mínimo: {settings.min_order_amount.toFixed(2)}€
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <Button
                                onClick={handleSaveDelivery}
                                disabled={loading}
                                className="gap-2 bg-primary text-white font-bold"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Guardar Configuración de Delivery
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'printers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-primary">
                                <Printer className="w-6 h-6" />
                                <h3 className="text-xl font-bold italic uppercase tracking-tighter">Hardware Bridge</h3>
                            </div>
                            <Button 
                                onClick={addPrinterNode}
                                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black gap-2"
                                size="sm"
                            >
                                <Plus className="w-4 h-4" /> Vincular Terminal
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {settings.printers.map((printer) => (
                                <div key={printer.id} className="bg-card border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700">
                                        <Printer className="w-32 h-32" />
                                    </div>
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Printer className="w-6 h-6" />
                                            </div>
                                            <input 
                                                value={printer.name}
                                                onChange={(e) => updatePrinterNode(printer.id, { name: e.target.value.toUpperCase() })}
                                                className="bg-transparent border-none p-0 text-xl font-black italic uppercase tracking-tighter w-full focus:ring-0 outline-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removePrinterNode(printer.id)}
                                            className="p-2 text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Zona</label>
                                            <select 
                                                value={printer.type}
                                                onChange={(e) => updatePrinterNode(printer.id, { type: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                            >
                                                <option value="cashier">Facturación</option>
                                                <option value="kitchen">Cocina</option>
                                                <option value="bar">Bar</option>
                                                <option value="other">Otros</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Conexión</label>
                                            <select 
                                                value={printer.connection}
                                                onChange={(e) => updatePrinterNode(printer.id, { connection: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                            >
                                                <option value="usb">USB Local</option>
                                                <option value="network">LAN / Red</option>
                                                <option value="bluetooth">Bluetooth</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Papel</label>
                                            <select 
                                                value={printer.paper_size}
                                                onChange={(e) => updatePrinterNode(printer.id, { paper_size: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                            >
                                                <option value="80mm">80mm Pro</option>
                                                <option value="58mm">58mm Lite</option>
                                            </select>
                                        </div>
                                        {printer.connection === 'network' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Dirección IP</label>
                                                <div className="relative">
                                                    <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground opacity-40" />
                                                    <input 
                                                        value={printer.target_ip || ""}
                                                        placeholder="192.168.1..."
                                                        onChange={(e) => updatePrinterNode(printer.id, { target_ip: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 text-xs font-mono outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {settings.printers.length === 0 && (
                                <div className="md:col-span-2 py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                                    <Printer className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-muted-foreground">No hay impresoras configuradas</p>
                                        <p className="text-xs text-muted-foreground/60">Vincule una terminal para habilitar la impresión de tickets</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6">
                            <Button
                                onClick={handleSavePrinters}
                                disabled={loading}
                                className="h-16 px-10 bg-primary text-black font-black uppercase italic rounded-2xl shadow-xl hover:bg-primary/80 transition-all gap-3"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                                    <>
                                        <Save className="w-5 h-5" /> GUARDAR ARQUITECTURA
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'instagram' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-pink-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center p-1">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                        <Instagram className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Conexión con Instagram</h3>
                                    <p className="text-sm text-pink-200/70">Publica tus productos directamente en tu feed.</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-pink-500/50 hover:bg-pink-500/20 text-pink-500">
                                Conectar Cuenta
                            </Button>
                        </div>

                        <div className="bg-card border border-white/10 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 text-lg">Publicación Rápida</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="aspect-square bg-black rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground hover:border-pink-500/50 hover:text-pink-500 transition-all cursor-pointer group">
                                    <Upload className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                                    <span>Arrastra una foto aquí</span>
                                    <span className="text-xs mt-1">o haz clic para seleccionar</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pie de foto</label>
                                        <textarea
                                            className="w-full h-32 p-3 rounded-lg bg-white/5 border border-white/10 resize-none focus:border-pink-500 outline-none transition-colors"
                                            placeholder="¡Nueva hamburguesa disponible! 🍔🔥 #Pozu20 #BurgerLover"
                                        />
                                    </div>
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold">
                                        <Instagram className="w-4 h-4 mr-2" /> Publicar en Instagram
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'features' && (
                    <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                            <Store className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Funcionalidades del Sitio</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div>
                                    <div className="font-bold">Combos en el Menú</div>
                                    <div className="text-sm text-muted-foreground">Habilitar la sección de combos en la barra de navegación</div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, enable_combos: !settings.enable_combos })}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.enable_combos ? 'bg-green-500' : 'bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.enable_combos ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div>
                                    <div className="font-bold">Reservas de Mesa</div>
                                    <div className="text-sm text-muted-foreground">Habilitar el sistema de reservas y mostrarlo en el sitio web</div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, reservations_enabled: !settings.reservations_enabled })}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.reservations_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.reservations_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveFeatures}
                            disabled={loading}
                            className="gap-2 bg-primary text-white font-bold mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Guardar Funcionalidades
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
