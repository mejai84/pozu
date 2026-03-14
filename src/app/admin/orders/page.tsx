"use client"

import { Button } from "@/components/ui/button"
import { Clock, MapPin, Bike, CheckCircle2, ChefHat, AlertCircle, X, User, Phone, Map, RefreshCcw, Plus, Trash2, Search, Filter, ArrowRight, DollarSign, ShoppingBag, Eye, CreditCard, Printer } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { printOrderTicket } from "@/lib/utils/print-ticket"

// Helper para tiempo transcurrido
const getElapsed = (dateString: string) => {
    const start = new Date(dateString).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 60000)
    if (diff < 1) return "Ahora"
    if (diff < 60) return `${diff}m`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m`
}

interface Product {
    id: string
    name: string
    price: number
    description: string | null
    image_url: string | null
    deleted_at: string | null
}

interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    unit_price: number
    products: {
        name: string
    } | null
    customizations?: {
        name?: string
        notes?: string | null
        mock_id?: string | null
    }
}

interface Order {
    id: string
    created_at: string
    status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
    order_type: 'pickup' | 'delivery' | 'dine_in'
    total: number
    subtotal: number
    guest_info: {
        name: string
        phone?: string
        email?: string
    }
    order_items: OrderItem[]
    payment_method: string
    payment_status: string
}

export default function AdminOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [businessInfo, setBusinessInfo] = useState<any>({
        business_name: "Pozu 2.0",
        address: "Pozu Restaurant",
        phone: "600 000 000"
    })

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newOrderItems, setNewOrderItems] = useState<(Product & { quantity: number; notes?: string })[]>([])
    const [customerName, setCustomerName] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [orderSearch, setOrderSearch] = useState("")

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

    const handleCreateOrder = async () => {
        if (newOrderItems.length === 0) return alert("Añade productos")
        try {
            const total = newOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
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
            const itemsToInsert = newOrderItems.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                customizations: { notes: item.notes || "" }
            }))
            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)
            if (itemsError) throw itemsError
            
            // Auto print for direct orders
            try {
                await printOrderTicket({
                    ...order,
                    order_items: newOrderItems.map(i => ({ ...i, products: { name: i.name }, unit_price: i.price, customizations: { notes: i.notes } }))
                }, businessInfo)
            } catch (printErr) {
                console.warn("Print error:", printErr)
            }

            alert("✓ Comanda enviada con éxito")
            setIsCreateOpen(false)
            setNewOrderItems([])
            setCustomerName("")
            fetchOrders()
        } catch (e: any) { 
            console.error("Order creation error:", e)
            alert("Error al crear comanda: " + (e.message || "Error desconocido")) 
        }
    }

    const filteredOrders = useMemo(() => {
        if (!orderSearch) return orders
        return orders.filter(o => 
            o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
            o.guest_info?.name?.toLowerCase().includes(orderSearch.toLowerCase())
        )
    }, [orders, orderSearch])

    const groups = {
        pending: filteredOrders.filter(o => o.status === 'pending'),
        preparing: filteredOrders.filter(o => o.status === 'preparing'),
        ready: filteredOrders.filter(o => o.status === 'ready' || o.status === 'out_for_delivery'),
        completed: filteredOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled')
    }

    const stats = {
        todayTotal: orders.reduce((acc, o) => acc + (new Date(o.created_at).toDateString() === new Date().toDateString() ? o.total : 0), 0),
        activeCount: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
    }

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Pro con Stats Rápidas */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#1A1A1A] border border-white/10 p-6 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
                
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        Terminal <span className="text-primary">Comandas</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Gestión de flujo operativo en tiempo real</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex gap-4">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">Hoy</p>
                            <p className="text-xl font-black italic text-primary">{stats.todayTotal.toFixed(1)}€</p>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 mb-1">En Curso</p>
                            <p className="text-xl font-black italic text-secondary">{stats.activeCount}</p>
                        </div>
                    </div>

                    <div className="h-10 w-[1px] bg-white/10 hidden xl:block" />

                    <div className="flex gap-2">
                        <Button onClick={() => setIsCreateOpen(true)} className="h-14 px-6 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80 shadow-lg shadow-primary/10">
                            <Plus className="w-5 h-5" /> Nueva Comanda
                        </Button>
                        <Link href="/admin/kitchen">
                            <Button variant="outline" className="h-14 px-6 rounded-2xl font-black uppercase italic tracking-tighter gap-3 border-white/10 hover:bg-white/5">
                                <ChefHat className="w-5 h-5 text-primary" /> KDS
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/40 font-bold transition-all"
                    placeholder="Filtrar por ID de pedido o nombre del cliente..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                />
            </div>

            {/* Tablero Kanban Pro */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full items-start">
                <OrderColumn title="Nuevas" icon={AlertCircle} color="text-blue-500" badgeColor="bg-blue-500/20 text-blue-500" orders={groups.pending} onView={setSelectedOrder} />
                <OrderColumn title="Cocina" icon={ChefHat} color="text-yellow-500" badgeColor="bg-yellow-500/20 text-yellow-500" orders={groups.preparing} onView={setSelectedOrder} />
                <OrderColumn title="Listos" icon={Bike} color="text-purple-500" badgeColor="bg-purple-500/20 text-purple-500" orders={groups.ready} onView={setSelectedOrder} />
                <OrderColumn title="Historial" icon={CheckCircle2} color="text-green-500" badgeColor="bg-green-500/20 text-green-500" orders={groups.completed.slice(0, 15)} onView={setSelectedOrder} isHistory />
            </div>

            {/* Create Order Modal (No modificado sustancialmente pero integrado) */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Terminal de Punto de Venta</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-white/5 rounded-xl"><X /></button>
                            </div>
                            <div className="flex-1 grid md:grid-cols-[1fr_400px] overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar border-r border-white/5">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm outline-none focus:border-primary/50" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                            <button key={p.id} onClick={() => {
                                                const existing = newOrderItems.find(i => i.id === p.id);
                                                if (existing) setNewOrderItems(prev => prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i))
                                                else setNewOrderItems(prev => [...prev, {...p, quantity: 1, notes: ""}])
                                            }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                                <div className="font-black italic uppercase text-xs group-hover:text-primary mb-1 truncate">{p.name}</div>
                                                <div className="text-lg font-black text-white">{p.price.toFixed(2)}€</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 bg-black/40 flex flex-col h-full">
                                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-6">Resumen Comanda</h3>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold mb-6 focus:border-primary/50 outline-none" placeholder="Nombre cliente / Mesa..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                        {newOrderItems.map((item, idx) => (
                                            <div key={`${item.id}-${idx}`} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-[11px] font-black uppercase text-primary italic tracking-tight"><span className="bg-primary/20 px-2 py-0.5 rounded-md mr-2">{item.quantity}x</span> {item.name}</div>
                                                    <button onClick={() => setNewOrderItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 opacity-40 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-[10px] font-bold outline-none focus:border-primary/30 transition-all italic text-muted-foreground"
                                                        placeholder="Toppings / Observaciones..."
                                                        value={item.notes || ""}
                                                        onChange={(e) => {
                                                            const newItems = [...newOrderItems]
                                                            newItems[idx].notes = e.target.value
                                                            setNewOrderItems(newItems)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-muted-foreground">TOTAL</span>
                                            <span className="text-3xl font-black italic text-primary">{newOrderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}€</span>
                                        </div>
                                        <Button onClick={handleCreateOrder} disabled={newOrderItems.length === 0} className="w-full h-16 rounded-2xl font-black uppercase italic bg-primary text-black hover:bg-primary/80">Lanzar Comanda</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal Pro */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-2xl"><ShoppingBag className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">ID #{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{selectedOrder.order_type} • {selectedOrder.payment_method}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-white/5 rounded-2xl trasition-all"><X /></button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Composición del Pedido</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.order_items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-black italic text-primary">{item.quantity}x</span>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold uppercase text-sm tracking-tight">{item.products?.name || item.customizations?.name || "Especial"}</span>
                                                        {item.customizations?.notes && (
                                                            <span className="text-[10px] text-primary font-black italic uppercase tracking-widest mt-0.5 transform -skew-x-12">
                                                                → {item.customizations.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-black italic">{(item.unit_price * item.quantity).toFixed(2)}€</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Cliente</p>
                                        <p className="font-extrabold uppercase italic tracking-tighter text-lg">{selectedOrder.guest_info?.name || "Sin identificar"}</p>
                                    </div>
                                    <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Contacto</p>
                                        <p className="font-extrabold text-sm">{selectedOrder.guest_info?.phone || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                                    <span className="font-black italic text-muted-foreground">INVERSIÓN TOTAL</span>
                                    <span className="text-4xl font-black italic text-primary">{selectedOrder.total.toFixed(2)}€</span>
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                                <Button variant="ghost" onClick={() => printOrderTicket(selectedOrder, businessInfo)} className="h-16 px-6 rounded-2xl border border-white/10 hover:bg-white/5 gap-2">
                                    <Printer className="w-5 h-5" /> Ticket
                                </Button>
                                <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="flex-1 h-16 rounded-2xl font-black uppercase italic text-xs">Cerrar</Button>
                                {['pending', 'preparing', 'ready', 'out_for_delivery'].includes(selectedOrder.status) && (
                                    <Button 
                                        onClick={async () => {
                                            const nextStatus: any = { 'pending': 'preparing', 'preparing': 'ready', 'ready': 'delivered', 'out_for_delivery': 'delivered' }
                                            const { error } = await supabase.from('orders').update({ status: nextStatus[selectedOrder.status] }).eq('id', selectedOrder.id)
                                            if (!error) { fetchOrders(); setSelectedOrder(null) }
                                        }}
                                        className="flex-[2] h-16 rounded-2xl font-black uppercase italic bg-primary text-black hover:bg-primary/80"
                                    >
                                        {selectedOrder.status === 'pending' ? 'Enviar a Cocina' : selectedOrder.status === 'preparing' ? 'Marcar como Listo' : 'Finalizar Pedido'}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}

function OrderColumn({ title, icon: Icon, color, badgeColor, orders, onView, isHistory = false }: any) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className={`flex items-center justify-between p-4 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${badgeColor}`}><Icon className="w-4 h-4" /></div>
                    <span className="font-black italic uppercase text-sm tracking-tighter">{title}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-black border border-white/5 ${color}`}>{orders.length}</span>
            </div>

            <div className="space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)] pb-20">
                {orders.map((o: any, i: number) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                        key={o.id} 
                        onClick={() => onView(o)}
                        className={`group relative bg-[#1A1A1A] border ${isHistory ? 'border-white/5 opacity-60' : 'border-white/10'} rounded-3xl p-5 cursor-pointer hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 active:scale-95`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-lg italic uppercase tracking-tighter group-hover:text-primary transition-colors">#{o.id.split('-')[0].toUpperCase()}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{o.guest_info?.name || "Cliente P"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-[10px] font-black italic bg-white/5 px-2 py-0.5 rounded text-primary">{getElapsed(o.created_at)}</div>
                                {o.payment_method === 'stripe' && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex flex-1 items-center gap-1 opacity-40">
                                {o.order_type === 'delivery' ? <Bike className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                <span className="text-[9px] font-black uppercase tracking-widest">{o.order_type}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black/30 rounded-md border border-white/5">{o.order_items?.length || 0} ITEMS</span>
                        </div>

                        <div className="flex justify-between items-end pt-4 border-t border-white/5">
                            <div className="text-xl font-black italic tracking-tighter">{o.total.toFixed(1)}€</div>
                            <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase italic bg-primary/10 text-primary border border-primary/20">Expandir</Button>
                        </div>
                    </motion.div>
                ))}
                {orders.length === 0 && (
                    <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Desierto</p>
                    </div>
                )}
            </div>
        </div>
    )
}
