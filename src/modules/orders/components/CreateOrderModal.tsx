import { useState } from "react"
import { motion } from "framer-motion"
import { X, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "../types"

interface Props {
    products: Product[]
    onClose: () => void
    onCreate: (name: string, items: (Product & { quantity: number; notes?: string })[]) => Promise<{ success: boolean; error?: string }>
}

export const CreateOrderModal = ({ products, onClose, onCreate }: Props) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [customerName, setCustomerName] = useState("")
    const [newOrderItems, setNewOrderItems] = useState<(Product & { quantity: number; notes?: string })[]>([])
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (newOrderItems.length === 0) return alert("Añade productos")
        setLoading(true)
        const res = await onCreate(customerName, newOrderItems)
        setLoading(false)
        if (res.success) {
            alert("✓ Comanda enviada con éxito")
            onClose()
        } else {
            alert("Error al crear comanda: " + res.error)
        }
    }

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Terminal de Punto de Venta</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl"><X /></button>
                </div>
                <div className="flex-1 grid md:grid-cols-[1fr_400px] overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar border-r border-white/5">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm outline-none focus:border-primary/50" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {filteredProducts.map(p => (
                                <button key={p.id} onClick={() => {
                                    const existingIndices = newOrderItems.findIndex(i => i.id === p.id);
                                    if (existingIndices > -1) {
                                        const copy = [...newOrderItems]
                                        copy[existingIndices].quantity += 1
                                        setNewOrderItems(copy)
                                    } else {
                                        setNewOrderItems(prev => [...prev, {...p, quantity: 1, notes: ""}])
                                    }
                                }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                    <div className="font-black italic uppercase text-xs group-hover:text-primary mb-1 truncate">{p.name}</div>
                                    <div className="text-lg font-black text-white">{p.price.toFixed(2)}€</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-8 bg-black/40 flex flex-col h-full">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-6">Resumen Comanda</h3>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold mb-6 focus:border-primary/50 outline-none" placeholder="Nombre cliente / Mesa..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {newOrderItems.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-[11px] font-black uppercase text-primary italic tracking-tight"><span className="bg-primary/20 px-2 py-0.5 rounded-md mr-2">{item.quantity}x</span> {item.name}</div>
                                        <button onClick={() => setNewOrderItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 opacity-40 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-[10px] font-bold outline-none focus:border-primary/30 transition-all italic text-muted-foreground"
                                            placeholder="Toppings / Observaciones..."
                                            value={item.notes || ""}
                                            onChange={(e) => {
                                                const newItems = [...newOrderItems]
                                                newItems[idx].notes = e.target.value
                                                setNewOrderItems(newItems)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-muted-foreground">TOTAL</span>
                                <span className="text-3xl font-black italic text-primary">{newOrderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}€</span>
                            </div>
                            <Button onClick={handleCreate} disabled={newOrderItems.length === 0 || loading} className="w-full h-16 rounded-2xl font-black uppercase italic bg-primary text-black hover:bg-primary/80">
                                {loading ? "Procesando..." : "Lanzar Comanda"}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
