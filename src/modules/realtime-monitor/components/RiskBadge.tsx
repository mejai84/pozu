import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  level?: 'VERDE' | 'AMARILLO' | 'ROJO'
}

export const RiskBadge = ({ level }: Props) => {
  const config = {
    ROJO: {
      color: "bg-red-600 text-white border-red-400 animate-pulse",
      icon: ShieldAlert,
      text: "LISTA NEGRA / RIESGO"
    },
    VERDE: {
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
      text: "CLIENTE FIABLE"
    },
    AMARILLO: {
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: ShieldQuestion,
      text: "CLIENTE NUEVO"
    }
  }[level || 'AMARILLO']

  const Icon = config.icon

  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-[8px] font-black flex items-center gap-1 shadow-lg border",
      config.color
    )}>
      <Icon className="w-3 h-3" />
      {config.text}
    </div>
  )
}
