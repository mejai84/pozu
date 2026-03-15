import { Button } from "@/components/ui/button"
import { Calendar, Filter } from "lucide-react"
import { DateRange } from "../types"

interface Props {
    dateRange: DateRange
    setDateRange: (r: DateRange) => void
    startDate: string
    setStartDate: (s: string) => void
    endDate: string
    setEndDate: (e: string) => void
    onGenerate: () => void
}

export const DateSelector = ({ 
    dateRange, setDateRange, 
    startDate, setStartDate, 
    endDate, setEndDate, 
    onGenerate 
}: Props) => {
    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="p-3 bg-white/5 rounded-xl text-primary">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Período de <span className="text-primary">Análisis</span></h3>
                    <p className="text-sm text-muted-foreground mt-1">Configura el rango temporal de tus métricas</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button
                    variant={dateRange === 'today' ? 'default' : 'outline'}
                    onClick={() => setDateRange('today')}
                    className={`rounded-xl font-bold ${dateRange === 'today' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                    Hoy
                </Button>
                <Button
                    variant={dateRange === 'week' ? 'default' : 'outline'}
                    onClick={() => setDateRange('week')}
                    className={`rounded-xl font-bold ${dateRange === 'week' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                    Última Semana
                </Button>
                <Button
                    variant={dateRange === 'month' ? 'default' : 'outline'}
                    onClick={() => setDateRange('month')}
                    className={`rounded-xl font-bold ${dateRange === 'month' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                    Último Mes
                </Button>
                <Button
                    variant={dateRange === 'custom' ? 'default' : 'outline'}
                    onClick={() => setDateRange('custom')}
                    className={`rounded-xl font-bold ${dateRange === 'custom' ? 'bg-primary text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                    Personalizado
                </Button>
            </div>

            {dateRange === 'custom' && (
                <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10"
                        />
                    </div>
                    <Button onClick={onGenerate} className="self-end">
                        <Filter className="w-4 h-4 mr-2" /> Generar
                    </Button>
                </div>
            )}
        </div>
    )
}
