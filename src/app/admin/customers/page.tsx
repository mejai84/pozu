"use client"

import { Users, Search, ShoppingBag, Phone, Loader2, Download, Filter, Star, Crown, History, ExternalLink, Calendar, DollarSign, ArrowRight, Mail, Pencil, Trash2, X, MessageCircle, AlertTriangle, Save } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Customer {
    name: string
    phone: string
    email?: string
    totalOrders: number
    totalSpent: number
    lastOrder: string
    orders: any[]
    points: number
    isRisk: boolean
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'vip' | 'loyal' | 'new' | 'risk'>('all')
    const [crmMetadata, setCrmMetadata] = useState<Record<string, { notes: string }>>({})
    const [savingNotes, setSavingNotes] = useState(false)
    const [tempNotes, setTempNotes] = useState("")

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

                // Calcular puntos y riesgo
                const finalCustomers = Array.from(customerMap.values()).map(c => {
                    const lastOrderDate = new Date(c.lastOrder)
                    const diffDays = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
                    
                    return {
                        ...c,
                        points: Math.floor(c.totalSpent / 10), // 1 punto cada 10€
                        isRisk: diffDays > 30 && c.totalSpent > 50 // Riesgo si no pide hace 30 días y ha gastado > 50€
                    }
                })

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

    const handleSaveNotes = async () => {
        if (!selectedCustomer) return
        setSavingNotes(true)
        try {
            const newMetadata = {
                ...crmMetadata,
                [selectedCustomer.phone]: {
                    ...crmMetadata[selectedCustomer.phone],
                    notes: tempNotes
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
            alert("Notas guardadas")
        } catch (err) {
            console.error(err)
            alert("Error al guardar notas")
        }
        setSavingNotes(false)
    }

    const handleDeleteCustomer = async (phone: string) => {
        if (!confirm("¿Seguro? Se anonimizarán los pedidos.")) return
        const { error } = await supabase
            .from('orders')
            .update({ guest_info: { name: 'Borrado', phone: '0000', email: '' } })
            .eq('guest_info->>phone', phone)
        
        if (!error) fetchCustomersAndMetadata()
    }

    const openWhatsApp = (phone: string, name: string) => {
        const cleanPhone = phone.replace(/\s+/g, '')
        const msg = encodeURIComponent(`¡Hola ${name}! Te escribimos de Pozu 2.0. Tenemos una oferta especial para ti...`)
        window.open(`https://wa.me/34${cleanPhone}?text=${msg}`, '_blank')
    }

    const getCustomerTag = (customer: Customer) => {
        if (customer.isRisk) return { label: 'FUGA', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle }
        if (customer.totalSpent > 150) return { label: 'VIP', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Crown }
        if (customer.totalOrders >= 5) return { label: 'FIEL', color: 'bg-primary/10 text-primary border-primary/20', icon: Star }
        if (customer.totalOrders === 1) return { label: 'NUEVO', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Calendar }
        return null
    }

    return (
        <div className="space-y-4 pb-10 max-w-[1400px] mx-auto text-sm px-4">
            {/* Header Compacto */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#1A1A1A] p-4 rounded-xl border border-white/10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">CRM <span className="text-primary">Pozu</span></h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Base de Datos Inteligente</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        {['all', 'vip', 'loyal', 'risk'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilterType(t as any)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${filterType === t ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                            >
                                {t === 'risk' ? 'Riesgo' : t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 pl-10 outline-none focus:ring-1 focus:ring-primary/40 font-bold text-sm"
                    placeholder="Buscar por nombre, tel o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                                <th className="p-4">Cliente / Contacto</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Puntos</th>
                                <th className="p-4 text-right">Gasto</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /></td></tr>
                            ) : processedCustomers.map((c, i) => {
                                const tag = getCustomerTag(c)
                                return (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors text-xs">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center font-black text-primary border border-primary/10">{c.name.charAt(0)}</div>
                                                <div>
                                                    <div className="font-bold">{c.name}</div>
                                                    <div className="text-[10px] opacity-40 font-mono">{c.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {tag && <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${tag.color}`}>{tag.label}</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 font-black text-primary italic">
                                                <Star className="w-3 h-3 fill-primary" /> {c.points}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-black italic">{c.totalSpent.toFixed(2)}€</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button onClick={() => openWhatsApp(c.phone, c.name)} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="WhatsApp">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => { setSelectedCustomer(c); setTempNotes(crmMetadata[c.phone]?.notes || "") }} className="p-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all" title="Detalles">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteCustomer(c.phone)} className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all" title="Eliminar">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detalle + Notas */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151515] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl text-primary font-black">{selectedCustomer.name.charAt(0)}</div>
                                    <div>
                                        <h2 className="text-lg font-black uppercase italic truncate max-w-[200px]">{selectedCustomer.name}</h2>
                                        <p className="text-[10px] font-bold text-muted-foreground">{selectedCustomer.phone}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <span className="text-[9px] font-black uppercase opacity-40 block mb-1">Puntos Pozu</span>
                                        <span className="text-xl font-black italic text-primary">{selectedCustomer.points}</span>
                                    </div>
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <span className="text-[9px] font-black uppercase opacity-40 block mb-1">Pedidos</span>
                                        <span className="text-xl font-black italic">{selectedCustomer.totalOrders}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <Pencil className="w-3 h-3 text-primary" /> Notas Internas (Personal/Staff)
                                    </label>
                                    <textarea 
                                        value={tempNotes}
                                        onChange={(e) => setTempNotes(e.target.value)}
                                        placeholder="Ej: Alergia a la cebolla, regalar postre..."
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-primary/40 resize-none font-medium"
                                    />
                                    <Button 
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes}
                                        className="w-full h-10 rounded-xl font-bold gap-2 text-xs"
                                    >
                                        {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Guardar Notas
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <History className="w-3 h-3 text-primary" /> Últimos Pedidos
                                    </label>
                                    <div className="max-h-[120px] overflow-y-auto pr-1 no-scrollbar space-y-1">
                                        {selectedCustomer.orders.slice(0, 5).map((o, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-[10px] border border-white/5">
                                                <span className="opacity-40">#{o.id.slice(0, 6)} - {new Date(o.created_at).toLocaleDateString()}</span>
                                                <span className="font-black text-primary italic">{o.total.toFixed(2)}€</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
