import { Search, Filter, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    searchTerm: string
    setSearchTerm: (s: string) => void
    loading: boolean
    onRefresh: () => void
}

export const ReservationToolbar = ({ searchTerm, setSearchTerm, loading, onRefresh }: Props) => {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-[1.5rem] p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/30 font-bold transition-all text-sm text-white"
                    placeholder="Buscar por nombre o teléfono..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" className="h-[60px] px-8 rounded-[1.5rem] border-white/10 bg-[#1A1A1A] font-bold gap-2 text-white">
                <Filter className="w-4 h-4" /> Filtrar
            </Button>
            <Button onClick={onRefresh} variant="outline" className="h-[60px] px-5 rounded-[1.5rem] border-white/10 bg-[#1A1A1A] text-white">
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            </Button>
        </div>
    )
}
