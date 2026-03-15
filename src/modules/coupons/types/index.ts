export interface Coupon {
    id: string
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
    min_purchase?: number
    active: boolean
    valid_until?: string
    usage_limit?: number
    usage_count: number
    created_at: string
}
