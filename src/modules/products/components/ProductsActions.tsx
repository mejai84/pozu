import { Search, LayoutGrid, List, Archive, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ViewMode } from "../types"

interface Props {
    searchQuery: string
    setSearchQuery: (q: string) => void
    categoryFilter: string
    setCategoryFilter: (c: string) => void
    viewMode: ViewMode
    setViewMode: (v: ViewMode) => void
    showDeleted: boolean
    setShowDeleted: (s: boolean) => void
    onAddClick: () => void
    categories: any[]
}

export const ProductsActions = ({ 
    searchQuery, setSearchQuery, 
    categoryFilter, setCategoryFilter, 
    viewMode, setViewMode, 
    showDeleted, setShowDeleted, 
    onAddClick, categories 
}: Props) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 pl-14 outline-none focus:ring-2 focus:ring-primary/40 text-lg font-bold shadow-xl transition-all"
                    placeholder="Buscar sabor, nombre o detalle..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-2 p-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl overflow-x-auto no-scrollbar">
                <select
                    className="bg-transparent px-4 py-2 font-black uppercase text-xs tracking-widest outline-none border-r border-white/10 cursor-pointer"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="all" className="bg-[#1A1A1A]">Todo</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1A1A1A]">{c.name}</option>)}
                </select>

                <div className="flex gap-1 border-r border-white/10 pr-2">
                    <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('table')} className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}><List className="w-4 h-4" /></button>
                </div>

                <button 
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`p-3 rounded-xl transition-all ${showDeleted ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                    title="Papelera"
                >
                    <Archive className="w-4 h-4" />
                </button>

                <Button onClick={onAddClick} className="px-8 py-2 rounded-xl font-black uppercase italic tracking-tighter gap-2 bg-primary hover:bg-primary/80 transition-all text-black h-full">
                    <Plus className="w-5 h-5" /> Crear Pro
                </Button>
            </div>
        </div>
    )
}
