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
    printers: PrinterConfig[]
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
