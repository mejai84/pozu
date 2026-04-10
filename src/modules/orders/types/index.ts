export interface Product {
    id: string
    name: string
    price: number
    description: string | null
    image_url: string | null
    deleted_at: string | null
}

export interface OrderItem {
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

export interface Order {
    id: string
    created_at: string
    status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
    order_type: 'pickup' | 'delivery' | 'dine_in'
    total: number
    subtotal: number
    guest_info: any
    order_items: OrderItem[]
    payment_method: string
    payment_status: string
    customer_name?: string
    customer_phone?: string
    payment_link?: string
    items?: any
}
