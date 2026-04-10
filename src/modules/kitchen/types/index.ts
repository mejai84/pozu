export type OrderItem = {
    quantity: number
    customizations: any
    products: {
        name: string
    } | null
}

export type Order = {
    id: string
    created_at: string
    status: string
    order_items: OrderItem[]
    guest_info?: any
    customer_name?: string
    customer_phone?: string
    payment_status?: string
    payment_link?: string
}

export interface BusinessInfo {
    business_name: string
    address: string
    phone: string
}
