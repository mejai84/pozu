import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Reservation, ReservationFormData } from '../types'

export const useReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReservations = async (showLoading = false) => {
        if (showLoading) setLoading(true)
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('reservation_date', { ascending: true })
            .order('reservation_time', { ascending: true })

        if (error) {
            console.error("Error fetching reservations:", error)
        } else {
            setReservations(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReservations(false)

        const channel = supabase.channel('reservations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => { fetchReservations(false) })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const updateStatus = async (id: string, status: Reservation['status']) => {
        const { error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)

        if (error) {
            alert("Error actualizando estado: " + error.message)
            return false
        }
        fetchReservations()
        return true
    }

    const createReservation = async (formData: ReservationFormData) => {
        const { error } = await supabase
            .from('reservations')
            .insert([{
                ...formData,
                status: 'confirmed'
            }])

        if (error) {
            alert("Error creando reserva: " + error.message)
            return false
        }
        fetchReservations()
        return true
    }

    return {
        reservations,
        loading,
        updateStatus,
        createReservation,
        refresh: fetchReservations
    }
}
