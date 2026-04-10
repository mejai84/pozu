export type OrderItem = {
  quantity: number
  unit_price: number
  notes: string | null
  products: {
    name: string
  } | null
}

export type Order = {
  id: string
  status: string
  total: number
  created_at: string
  order_type: string
  customer_phone: string | null
  delivery_zone: string | null
  estimated_arrival: string | null
  guest_info: any
  is_paid: boolean
  source: string | null
  order_items: OrderItem[]
  risk_level?: 'VERDE' | 'AMARILLO' | 'ROJO'
  customer_name?: string
  payment_status?: string
  payment_link?: string
}
