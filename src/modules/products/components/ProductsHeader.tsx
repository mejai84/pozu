import { Zap } from "lucide-react"

interface Props {
    stats: {
        total: number
        outOfStock: number
        featured: number
    }
}

export const ProductsHeader = ({ stats }: Props) => {
    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Zap className="w-3 h-3" /> Inventario Maestro
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                        Catálogo <span className="text-primary">Pozu</span>
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg text-lg">
                        Control total sobre tus productos, precios y multimedia. Sube videos y destaca lo mejor.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black italic text-primary">{stats.total}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Activos</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black italic text-orange-500">{stats.outOfStock}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Agotados</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hidden sm:block">
                        <div className="text-3xl font-black italic text-yellow-500">{stats.featured}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Best Sellers</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
