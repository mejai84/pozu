export type OrderItem = {
    quantity: number
    products: {
        name: string
    } | null
}

export interface DeliveryIncident {
    type: 'not_found' | 'wrong_address' | 'client_absent' | 'damage' | 'other'
    description: string
    timestamp: string
    photo_url?: string
}

export type DeliveryOrder = {
    id: string
    status: 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
    total: number
    created_at: string
    order_type: string
    customer_phone: string | null
    delivery_address: {
        street?: string
        city?: string
        coordinates?: {
            lat: number
            lng: number
        }
        notes?: string
        address?: string
    } | null
    guest_info: {
        name: string
        phone?: string
        avatar?: string
    } | null
    payment_method: string
    payment_status: string
    order_items: OrderItem[]
    incidents?: DeliveryIncident[]
    delivery_notes?: string
    delivered_at?: string
    signature_url?: string
}

