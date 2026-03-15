import { motion } from "framer-motion"
import Image from "next/image"
import { VideoIcon, Package, Zap, Pencil, Trash2, AlertOctagon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Product } from "../types"

interface Props {
    product: Product
    index: number
    categoryName?: string
    onEdit: (p: Product) => void
    onDelete: (id: string) => void
    onRestore: (id: string) => void
    onToggleAvailability: (p: Product) => void
}

export const ProductCard = ({ 
    product, index, categoryName, 
    onEdit, onDelete, onRestore, onToggleAvailability 
}: Props) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10"
        >
            {/* Media Container */}
            <div className="aspect-square relative overflow-hidden bg-black/40 border-b border-white/5">
                {product.options?.video_url ? (
                    <video src={product.options.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <Image src={product.image_url || "/images/placeholder.png"} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.options?.badge && (
                        <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest italic shadow-lg">
                            {product.options.badge}
                        </span>
                    )}
                    {product.options?.video_url && (
                        <span className="px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                            <VideoIcon className="w-3 h-3" /> Motion
                        </span>
                    )}
                    {/* Stock Badge */}
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1",
                        (product.stock_quantity ?? 0) > 10 ? "bg-green-500/20 text-green-500 border border-green-500/20" : 
                        (product.stock_quantity ?? 0) > 0 ? "bg-orange-500/20 text-orange-500 border border-orange-500/20" : 
                        "bg-red-500 text-white"
                    )}>
                        <Package className="w-3 h-3" /> {product.stock_quantity ?? 0}
                    </span>
                </div>
                {!product.deleted_at && (
                    <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
                        <button onClick={() => onToggleAvailability(product)} className={`p-2 rounded-xl border ${product.is_available && (product.stock_quantity ?? 0) > 0 ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                            <Zap className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-xl italic uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{categoryName}</p>
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter text-white ml-2">{product.price.toFixed(2)}€</div>
                </div>
                
                {product.allergens && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-tighter bg-red-400/10 px-2 py-1 rounded-lg">
                        <AlertOctagon className="w-3 h-3" /> {product.allergens}
                    </div>
                )}

                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {product.description || 'Sin descripción culinaria.'}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    {product.deleted_at ? (
                        <Button onClick={() => onRestore(product.id)} className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-[10px] h-11 tracking-widest italic gap-2">
                             <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => onEdit(product)} variant="ghost" className="flex-1 bg-white/5 hover:bg-primary hover:text-black rounded-xl font-bold uppercase text-[10px] h-11 tracking-widest italic">
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                            </Button>
                            <button onClick={() => onDelete(product.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
