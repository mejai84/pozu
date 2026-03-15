import { Zap, Bell, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  isNotificationsEnabled: boolean
  onToggleNotifications: () => void
  onRefresh: () => void
  lastUpdate: Date
}

export const MonitorHeader = ({ isNotificationsEnabled, onToggleNotifications, onRefresh, lastUpdate }: Props) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-[2.5rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-[60px] -z-10" />
      
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20">
          <Zap className="w-8 h-8 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            Monitor <span className="text-primary italic">Realtime</span>
          </h1>
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sincronizado vía Supabase • Actualizado {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-6 md:mt-0">
        <Button 
          variant="outline" 
          onClick={onToggleNotifications}
          className={cn(
            "rounded-2xl h-14 px-6 border-white/10 transition-all gap-2",
            isNotificationsEnabled ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5"
          )}
        >
          <Bell className={cn("w-5 h-5", isNotificationsEnabled && "animate-bounce")} />
          {isNotificationsEnabled ? "Alertas ON" : "Alertas OFF"}
        </Button>
        <Button 
          onClick={onRefresh}
          variant="outline"
          className="rounded-2xl h-14 w-14 p-0 border-white/10 bg-white/5 hover:bg-white/10"
        >
          <Clock className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
