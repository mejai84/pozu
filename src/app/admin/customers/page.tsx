"use client"

import { Users, Search, ShoppingBag, Phone, Loader2, Download, Filter, Star, Crown, History, ExternalLink, Calendar, DollarSign, ArrowRight } from "lucide-react"
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
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'vip' | 'loyal' | 'new'>('all')

    const fetchCustomers = async () => {
        setLoading(true)
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
        } else if (orders) {
            const customerMap = new Map<string, Customer>()

            orders.forEach(order => {
                const name = order.guest_info?.name || "Desconocido"
                const phone = order.guest_info?.phone || "Sin teléfono"
                const email = order.guest_info?.email
                const key = `${name}-${phone}`

                if (!customerMap.has(key)) {
                    customerMap.set(key, {
                        name,
                        phone,
                        email,
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrder: order.created_at,
                        orders: []
                    })
                }

                const customer = customerMap.get(key)!
                customer.totalOrders += 1
                customer.totalSpent += (order.total || 0)
                customer.orders.push(order)
                
                // Ensure lastOrder is truly the latest
                if (new Date(order.created_at) > new Date(customer.lastOrder)) {
                    customer.lastOrder = order.created_at
                }
            })

            setCustomers(Array.from(customerMap.values()))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const processedCustomers = useMemo(() => {
        let filtered = customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filterType === 'vip') {
            filtered = filtered.filter(c => c.totalSpent > 100)
        } else if (filterType === 'loyal') {
            filtered = filtered.filter(c => c.totalOrders >= 5)
        } else if (filterType === 'new') {
            filtered = filtered.filter(c => c.totalOrders === 1)
        }

        return filtered.sort((a, b) => b.totalSpent - a.totalSpent)
    }, [customers, searchTerm, filterType])

    const exportToCSV = () => {
        const headers = ["Nombre", "Teléfono", "Email", "Pedidos", "Total Gastado", "Último Pedido"]
        const data = processedCustomers.map(c => [
            c.name,
            c.phone,
            c.email || 'N/A',
            c.totalOrders,
            c.totalSpent.toFixed(2),
            new Date(c.lastOrder).toLocaleDateString()
        ])
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + data.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `clientes_pozu_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const getCustomerTag = (customer: Customer) => {
        if (customer.totalSpent > 150) return { label: 'VIP', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Crown }
        if (customer.totalOrders >= 5) return { label: 'FIEL', color: 'bg-primary/10 text-primary border-primary/20', icon: Star }
        if (customer.totalOrders === 1) return { label: 'NUEVO', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Calendar }
        return null
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header Pro */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors duration-700" />
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Users className="w-3 h-3" /> Base de Datos
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                            Comunidad <span className="text-primary">Pozu</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-xl">
                            Analiza el comportamiento de tus clientes, identifica a tus VIPs y gestiona tu fidelización.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button 
                            onClick={exportToCSV}
                            variant="outline" 
                            className="bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl font-bold gap-2 h-14"
                        >
                            <Download className="w-4 h-4" /> Exportar CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 pl-14 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-lg shadow-xl"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 bg-[#1A1A1A] p-2 rounded-[2rem] border border-white/10 shadow-xl overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'Todos', active: filterType === 'all' },
                        { id: 'vip', label: 'VIPs', active: filterType === 'vip' },
                        { id: 'loyal', label: 'Fieles', active: filterType === 'loyal' },
                        { id: 'new', label: 'Nuevos', active: filterType === 'new' },
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilterType(btn.id as any)}
                            className={`px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-tighter text-xs transition-all whitespace-nowrap ${
                                btn.active 
                                ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla Estilizada */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-muted-foreground gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-sm italic">Sincronizando perfiles...</p>
                    </div>
                ) : processedCustomers.length === 0 ? (
                    <div className="p-32 text-center text-muted-foreground">
                        <Users className="w-24 h-24 mx-auto mb-6 opacity-10" />
                        <p className="font-bold text-xl uppercase tracking-tighter">No hay coincidencias</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Cliente</th>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Contacto</th>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Fidelidad</th>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Inversión Total</th>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Última Visita</th>
                                    <th className="p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {processedCustomers.map((customer, i) => {
                                    const tag = getCustomerTag(customer)
                                    const TagIcon = tag?.icon

                                    return (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={i} 
                                            className="hover:bg-white/[0.03] transition-all group cursor-pointer"
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/20 group-hover:scale-110 transition-transform">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg group-hover:text-primary transition-colors">{customer.name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
                                                            {customer.totalOrders} Pedidos realizados
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold">
                                                        <Phone className="w-3 h-3 text-primary" />
                                                        {customer.phone}
                                                    </div>
                                                    {customer.email && (
                                                        <div className="text-xs text-muted-foreground opacity-60">
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-8 text-center">
                                                {tag && (
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border tracking-tighter uppercase ${tag.color}`}>
                                                        {TagIcon && <TagIcon className="w-3 h-3" />}
                                                        {tag.label}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="text-2xl font-black italic tracking-tighter text-white group-hover:text-primary transition-colors">
                                                    {customer.totalSpent.toFixed(2)}€
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">LTV Estimado</div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm text-white">{new Date(customer.lastOrder).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Reciente</span>
                                                </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary group-hover:text-black">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Detalle Cliente */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#1A1A1A] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-4xl text-primary font-black">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">{selectedCustomer.name}</h2>
                                        <div className="flex gap-2 mt-2">
                                            {getCustomerTag(selectedCustomer) && (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getCustomerTag(selectedCustomer)?.color}`}>
                                                    {getCustomerTag(selectedCustomer)?.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Métricas de Valor</p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-muted-foreground">Gasto Total</span>
                                            <span className="text-2xl font-black italic text-primary">{selectedCustomer.totalSpent.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-muted-foreground">Pedidos</span>
                                            <span className="text-2xl font-black italic">{selectedCustomer.totalOrders}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Información de Contacto</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <span className="font-bold">{selectedCustomer.phone}</span>
                                        </div>
                                        {selectedCustomer.email && (
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <MailIcon className="w-4 h-4 text-primary" />
                                                <span className="font-bold text-sm truncate">{selectedCustomer.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 min-h-[300px]">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 mb-6">
                                    <History className="w-5 h-5 text-primary" /> Historial Reciente
                                </h3>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                                    {selectedCustomer.orders.map((order, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="text-xs font-mono font-bold bg-white/10 px-2 py-1 rounded-lg">#{order.id.slice(0, 8)}</div>
                                                <div className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-black italic text-primary">{order.total.toFixed(2)}€</span>
                                                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase border border-green-500/20">Pagado</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function XIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
}

function MailIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
}
