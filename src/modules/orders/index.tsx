"use client"

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useOrders } from './hooks/useOrders'
import { OrderHeader } from './components/OrderHeader'
import { OrderBoard } from './components/OrderBoard'
import { CreateOrderModal } from './components/CreateOrderModal'
import { OrderDetailModal } from './components/OrderDetailModal'

export const OrdersModule = () => {
    const {
        orders,
        products,
        loading,
        businessInfo,
        createOrder,
        updateOrderStatus
    } = useOrders()

    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [orderSearch, setOrderSearch] = useState("")

    const filteredOrders = useMemo(() => {
        if (!orderSearch) return orders
        return orders.filter(o => 
            o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
            o.guest_info?.name?.toLowerCase().includes(orderSearch.toLowerCase())
        )
    }, [orders, orderSearch])

    const stats = useMemo(() => {
        const todayStr = new Date().toDateString()
        return {
            todayTotal: orders.reduce((acc, o) => acc + (new Date(o.created_at).toDateString() === todayStr ? (o.total || 0) : 0), 0),
            activeCount: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
        }
    }, [orders])

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto min-h-screen">
            <OrderHeader 
                todayTotal={stats.todayTotal} 
                activeCount={stats.activeCount} 
                onOpenCreate={() => setIsCreateOpen(true)} 
            />

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/40 font-bold transition-all text-white"
                    placeholder="Filtrar por ID de pedido o nombre del cliente..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                />
            </div>

            <OrderBoard 
                orders={filteredOrders} 
                onView={setSelectedOrder} 
            />

            <AnimatePresence>
                {isCreateOpen && (
                    <CreateOrderModal 
                        products={products} 
                        onClose={() => setIsCreateOpen(false)} 
                        onCreate={createOrder} 
                    />
                )}
                {selectedOrder && (
                    <OrderDetailModal 
                        order={selectedOrder} 
                        onClose={() => setSelectedOrder(null)} 
                        onUpdateStatus={updateOrderStatus} 
                        businessInfo={businessInfo} 
                    />
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
