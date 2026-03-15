import { motion } from "framer-motion"
import Image from "next/image"
import { Pencil, Trash2, AlertOctagon, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Product } from "../types"

interface Props {
    products: Product[]
    categories: any[]
    onEdit: (p: Product) => void
    onDelete: (id: string) => void
    onRestore: (id: string) => void
}

export const ProductsTable = ({ products, categories, onEdit, onDelete, onRestore }: Props) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                        <th className="p-6">Producto</th>
                        <th className="p-6">Categoría</th>
                        <th className="p-6 text-center">Stock</th>
                        <th className="p-6 text-center">Inversión</th>
                        <th className="p-6 text-center">Status</th>
                        <th className="p-6 text-right">Manejo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-black relative overflow-hidden border border-white/10">
                                        <Image src={p.image_url || "/images/placeholder.png"} alt={p.name} fill className="object-cover opacity-80" />
                                    </div>
                                    <div>
                                        <span className="font-black text-lg italic uppercase tracking-tighter truncate max-w-[200px] block">{p.name}</span>
                                        <div className="flex gap-2 items-center">
                                            {p.options?.badge && <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">{p.options.badge}</span>}
                                            {p.allergens && <span className="text-[9px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1"><AlertOctagon className="w-2.5 h-2.5" /> Alérgenos</span>}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className="text-xs font-bold text-muted-foreground uppercase">{categories.find(c => c.id === p.category_id)?.name}</span>
                            </td>
                            <td className="p-6 text-center">
                                <div className={cn(
                                    "font-black text-lg",
                                    (p.stock_quantity ?? 0) <= 0 ? "text-red-500" : "text-white"
                                )}>
                                    {p.stock_quantity ?? 0}
                                </div>
                            </td>
                            <td className="p-6 text-center font-black italic text-lg">{p.price.toFixed(2)}€</td>
                            <td className="p-6 text-center">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${p.is_available && (p.stock_quantity ?? 0) > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {p.is_available && (p.stock_quantity ?? 0) > 0 ? 'ACTIVO' : 'AGOTADO'}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                <div className="flex justify-end gap-2">
                                    {p.deleted_at ? (
                                        <button onClick={() => onRestore(p.id)} className="p-2 bg-white/5 hover:bg-green-600 hover:text-white rounded-lg transition-all"><RotateCcw className="w-4 h-4" /></button>
                                    ) : (
                                        <>
                                            <button onClick={() => onEdit(p)} className="p-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(p.id)} className="p-2 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    )
}
