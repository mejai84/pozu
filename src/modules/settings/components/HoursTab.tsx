import { Clock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeekHours } from "../types"

interface Props {
    businessHours: WeekHours
    setBusinessHours: (h: WeekHours) => void
    onSave: () => void
    loading: boolean
}

export const HoursTab = ({ businessHours, setBusinessHours, onSave, loading }: Props) => {
    const dayLabels: Record<string, string> = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo'
    }

    const toggleDay = (day: string) => {
        setBusinessHours({
            ...businessHours,
            [day]: { ...businessHours[day as keyof WeekHours], closed: !businessHours[day as keyof WeekHours].closed }
        })
    }

    const updateHour = (day: string, field: 'open' | 'close', value: string) => {
        setBusinessHours({
            ...businessHours,
            [day]: { ...businessHours[day as keyof WeekHours], [field]: value }
        })
    }

    return (
        <div className="bg-card border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-primary pb-4 border-b border-white/10 mb-6">
                <Clock className="w-6 h-6" />
                <div>
                    <h3 className="text-xl font-bold">Horario de Atención</h3>
                    <p className="text-sm text-muted-foreground">Configura los horarios de tu negocio</p>
                </div>
            </div>

            <div className="space-y-3">
                {Object.entries(businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="w-32">
                            <span className="font-bold capitalize">{dayLabels[day]}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                            {!hours.closed ? (
                                <>
                                    <input
                                        type="time"
                                        value={hours.open}
                                        className="p-2 rounded bg-white/5 border border-white/10 font-mono"
                                        onChange={(e) => updateHour(day, 'open', e.target.value)}
                                    />
                                    <span className="text-muted-foreground">a</span>
                                    <input
                                        type="time"
                                        value={hours.close}
                                        className="p-2 rounded bg-white/5 border border-white/10 font-mono"
                                        onChange={(e) => updateHour(day, 'close', e.target.value)}
                                    />
                                </>
                            ) : (
                                <span className="text-red-500 font-medium">Cerrado</span>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDay(day)}
                            className={hours.closed ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}
                        >
                            {hours.closed ? 'Abrir' : 'Cerrar'}
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                onClick={onSave}
                disabled={loading}
                className="gap-2 bg-primary text-black font-bold mt-6"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Guardar Horarios
                    </>
                )}
            </Button>
        </div>
    )
}
