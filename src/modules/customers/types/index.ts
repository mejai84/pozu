export interface Customer {
    name: string
    phone: string
    email?: string
    totalOrders: number
    totalSpent: number
    lastOrder: string
    orders: any[]
    points: number
    isRisk: boolean
    riskLevel?: 'VERDE' | 'AMARILLO' | 'ROJO'
    address?: string
}

export interface CRMMetadata {
    [phone: string]: {
        notes: string
    }
}
