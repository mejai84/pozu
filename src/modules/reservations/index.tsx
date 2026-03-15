"use client"

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useReservations } from './hooks/useReservations'
import { ReservationHeader } from './components/ReservationHeader'
import { ReservationToolbar } from './components/ReservationToolbar'
import { ReservationTable } from './components/ReservationTable'
import { ReservationFormModal } from './components/ReservationFormModal'
import { ReservationDetailModal } from './components/ReservationDetailModal'
import { Reservation } from './types'

export const ReservationsModule = () => {
    const { 
        reservations, 
        loading, 
        updateStatus, 
        createReservation, 
        refresh 
    } = useReservations()

    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedRes, setSelectedRes] = useState<Reservation | null>(null)

    const filteredReservations = useMemo(() => {
        return reservations.filter(r => 
            r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customer_phone.includes(searchTerm)
        )
    }, [reservations, searchTerm])

    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0]
        return {
            today: reservations.filter(r => r.reservation_date === todayStr).length,
            pending: reservations.filter(r => r.status === 'pending').length
        }
    }, [reservations])

    return (
        <div className="space-y-8 pb-20 max-w-[1400px] mx-auto min-h-screen">
            <ReservationHeader 
                todayCount={stats.today}
                pendingCount={stats.pending}
                onOpenCreate={() => setIsCreateOpen(true)}
            />

            <ReservationToolbar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loading={loading}
                onRefresh={refresh}
            />

            <ReservationTable 
                reservations={filteredReservations}
                onUpdateStatus={updateStatus}
                onViewDetail={setSelectedRes}
            />

            <AnimatePresence>
                {isCreateOpen && (
                    <ReservationFormModal 
                        onClose={() => setIsCreateOpen(false)}
                        onSubmit={createReservation}
                    />
                )}
                {selectedRes && (
                    <ReservationDetailModal 
                        reservation={selectedRes}
                        onClose={() => setSelectedRes(null)}
                        onUpdateStatus={updateStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
