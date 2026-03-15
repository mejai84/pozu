"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeOrders } from './hooks/useRealtimeOrders'
import { MonitorHeader } from './components/MonitorHeader'
import { OrderCard } from './components/OrderCard'

export const RealtimeMonitorModule = () => {
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
    const { 
        orders, 
        loading, 
        lastUpdate, 
        isPrinting, 
        updateOrderStatus, 
        handlePrint, 
        refresh 
    } = useRealtimeOrders(isNotificationsEnabled)

    return (
        <div className="min-h-full flex flex-col gap-8 pb-20">
            <MonitorHeader 
                isNotificationsEnabled={isNotificationsEnabled}
                onToggleNotifications={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                onRefresh={refresh}
                lastUpdate={lastUpdate}
            />

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {orders.map((order, index) => (
                            <OrderCard 
                                key={order.id}
                                order={order}
                                index={index}
                                isPrinting={isPrinting === order.id}
                                onPrint={() => handlePrint(order)}
                                onUpdateStatus={updateOrderStatus}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <style jsx global>{`
                .glass {
                    background: rgba(26, 26, 26, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
