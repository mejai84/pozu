"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChefHat } from "lucide-react"
import { useKDS } from "./hooks/useKDS"
import { KDSCard } from "./components/KDSCard"
import { KDSHeader } from "./components/KDSHeader"
import { KDSModal } from "./components/KDSModal"
import { Order } from "./types"

export const KitchenModule = () => {
    const { 
        orders, 
        loading, 
        lastFetch, 
        isAlertEnabled, 
        setIsAlertEnabled, 
        businessInfo, 
        updateStatus, 
        fetchOrders,
        counts 
    } = useKDS()

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const getElapsedMinutes = (dateString: string) => {
        const start = new Date(dateString).getTime()
        const now = new Date().getTime()
        return Math.floor((now - start) / 60000)
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-10 font-sans selection:bg-orange-500 selection:text-white">
            <KDSHeader 
                preparingCount={counts.preparing}
                confirmedCount={counts.confirmed}
                isAlertEnabled={isAlertEnabled}
                onToggleAlert={() => setIsAlertEnabled(!isAlertEnabled)}
                onRefresh={fetchOrders}
                loading={loading}
                lastFetch={lastFetch}
            />

            <AnimatePresence mode="popLayout">
                {orders.length === 0 && !loading ? (
                    <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-[#0A0A0A]">
                        <ChefHat className="w-32 h-32 text-white/5 mb-8" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter opacity-10">Cocina Despejada</h2>
                        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-xs opacity-40">No hay comandas pendientes de fuego</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {orders.map((order, idx) => (
                            <KDSCard 
                                key={order.id} 
                                order={order} 
                                index={idx}
                                onMarchar={() => updateStatus(order.id, 'preparing')}
                                onListo={() => updateStatus(order.id, 'ready')}
                                onExpand={() => setSelectedOrder(order)}
                                minutes={getElapsedMinutes(order.created_at)}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {selectedOrder && (
                <KDSModal 
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    updateStatus={updateStatus}
                    minutes={getElapsedMinutes(selectedOrder.created_at)}
                    businessInfo={businessInfo}
                />
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes pulse-intense {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .pulse-kitchen { animation: pulse-intense 2s infinite ease-in-out; }
            `}</style>
        </div>
    )
}
