export interface PrinterConfig {
    id: string
    name: string
    type: "cashier" | "kitchen" | "bar" | "other"
    connection: "usb" | "network" | "bluetooth"
    paper_size: "58mm" | "80mm"
    target_ip?: string
}

export interface Settings {
    business_name: string
    phone: string
    email: string
    address: string
    delivery_fee: number
    min_order_amount: number
    is_open: boolean
    enable_combos: boolean
    reservations_enabled: boolean
    online_payments_enabled: boolean
    cash_payments_enabled: boolean
    tracking_enabled: boolean
    takeaway_enabled: boolean
    delivery_enabled: boolean
    delivery_signature_enabled: boolean
    maintenance_mode: boolean
    taxes_enabled: boolean
    tax_percentage: number
    printers: PrinterConfig[]
    stripe_public_key?: string
    stripe_secret_key?: string
}

export interface BusinessHours {
    open: string
    close: string
    closed: boolean
}

export interface WeekHours {
    monday: BusinessHours
    tuesday: BusinessHours
    wednesday: BusinessHours
    thursday: BusinessHours
    friday: BusinessHours
    saturday: BusinessHours
    sunday: BusinessHours
}
