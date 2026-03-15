import { Star, Crown, Calendar, AlertTriangle, ShieldAlert } from "lucide-react"
import { Customer } from "../types"

export const getCustomerTag = (customer: Customer) => {
    if (customer.riskLevel === 'ROJO') return { label: 'LISTA NEGRA', color: 'bg-red-600 text-white border-red-500 animate-pulse', icon: ShieldAlert }
    if (customer.riskLevel === 'VERDE') return { label: 'VIP FIABLE', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Crown }
    if (customer.totalSpent > 150) return { label: 'VIP', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Crown }
    if (customer.totalOrders >= 5) return { label: 'FIEL', color: 'bg-primary/10 text-primary border-primary/20', icon: Star }
    if (customer.totalOrders === 1) return { label: 'NUEVO', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Calendar }
    return null
}

export const CustomerTag = ({ customer }: { customer: Customer }) => {
    const tag = getCustomerTag(customer)
    if (!tag) return null
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${tag.color}`}>
            {tag.label}
        </span>
    )
}
