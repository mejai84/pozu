export interface Reservation {
    id: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    reservation_date: string
    reservation_time: string
    guests_count: number
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    notes: string | null
    created_at: string
}

export interface ReservationFormData {
    customer_name: string
    customer_phone: string
    customer_email: string
    reservation_date: string
    reservation_time: string
    guests_count: number
    notes: string
}
