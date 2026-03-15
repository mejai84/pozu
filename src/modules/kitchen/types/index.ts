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
}

export interface BusinessInfo {
    business_name: string
    address: string
    phone: string
}
