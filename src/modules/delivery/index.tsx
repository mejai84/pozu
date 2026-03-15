"use client"

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, Map, List, History, Search } from 'lucide-react'
import { useDelivery } from './hooks/useDelivery'
import { DeliveryHeader } from './components/DeliveryHeader'
import { DeliveryCard } from './components/DeliveryCard'
import { DeliveryOrder } from './types'
import { cn } from '@/lib/utils'

type Tab = 'active' | 'history'

export const DeliveryModule = () => {
    const { orders, loading, updateStatus, reportIncident } = useDelivery()
    const [activeTab, setActiveTab] = useState<Tab>('active')
    const [search, setSearch] = useState("")

    const filteredOrders = useMemo(() => {
        let base: DeliveryOrder[] = orders
        if (activeTab === 'active') {
            base = orders.filter(o => ['ready', 'out_for_delivery'].includes(o.status))
        } else {
            base = orders.filter(o => o.status === 'delivered')
        }

        if (search) {
            base = base.filter(o => 
                (o.id?.toLowerCase().includes(search.toLowerCase())) || 
                (o.guest_info?.name?.toLowerCase().includes(search.toLowerCase())) ||
                (o.delivery_address?.street?.toLowerCase().includes(search.toLowerCase()))
            )
        }
        return base
    }, [orders, activeTab, search])

    const counts = {
        active: orders.filter(o => ['ready', 'out_for_delivery'].includes(o.status)).length,
        history: orders.filter(o => o.status === 'delivered').length
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <DeliveryHeader count={counts.active} />

            {/* Filter & Tabs Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1A1A1A]/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                            activeTab === 'active' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <List className="w-4 h-4" /> Activos ({counts.active})
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                            activeTab === 'history' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <History className="w-4 h-4" /> Historial ({counts.history})
                    </button>
                </div>

                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 pl-12 outline-none focus:ring-2 focus:ring-primary/20 font-bold transition-all text-sm text-white"
                        placeholder="Buscar por ID, cliente o calle..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {loading && filteredOrders.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[3rem] p-24 text-center space-y-6 border border-dashed border-white/10"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black italic uppercase tracking-tighter text-white opacity-40">Sin pedidos en esta sección</p>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-30">Todo fluido por ahora</p>
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order, idx) => (
                            <DeliveryCard 
                                key={order.id} 
                                order={order} 
                                index={idx} 
                                onUpdateStatus={updateStatus} 
                                onReportIncident={reportIncident}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}
