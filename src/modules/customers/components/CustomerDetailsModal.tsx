import { motion, AnimatePresence } from "framer-motion"
import { X, Pencil, History, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Customer } from "../types"
import { useState, useEffect } from "react"

interface Props {
    customer: Customer | null
    onClose: () => void
    onSaveNotes: (phone: string, notes: string) => Promise<boolean>
    savingNotes: boolean
    initialNotes: string
}

export const CustomerDetailsModal = ({ customer, onClose, onSaveNotes, savingNotes, initialNotes }: Props) => {
    const [tempNotes, setTempNotes] = useState(initialNotes)

    useEffect(() => {
        setTempNotes(initialNotes)
    }, [initialNotes])

    if (!customer) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151515] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl text-primary font-black">{customer.name.charAt(0)}</div>
                            <div>
                                <h2 className="text-lg font-black uppercase italic truncate max-w-[200px]">{customer.name}</h2>
                                <p className="text-[10px] font-bold text-muted-foreground">{customer.phone}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                <span className="text-[9px] font-black uppercase opacity-40 block mb-1">Puntos Pozu</span>
                                <span className="text-xl font-black italic text-primary">{customer.points}</span>
                            </div>
                            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                <span className="text-[9px] font-black uppercase opacity-40 block mb-1">Pedidos</span>
                                <span className="text-xl font-black italic">{customer.totalOrders}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Pencil className="w-3 h-3 text-primary" /> Notas Internas (Personal/Staff)
                            </label>
                            <textarea 
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="Ej: Alergia a la cebolla, regalar postre..."
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-primary/40 resize-none font-medium"
                            />
                            <Button 
                                onClick={() => onSaveNotes(customer.phone, tempNotes)}
                                disabled={savingNotes}
                                className="w-full h-10 rounded-xl font-bold gap-2 text-xs"
                            >
                                {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Guardar Notas
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <History className="w-3 h-3 text-primary" /> Últimos Pedidos
                            </label>
                            <div className="max-h-[120px] overflow-y-auto pr-1 no-scrollbar space-y-1">
                                {customer.orders.slice(0, 5).map((o, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-[10px] border border-white/5">
                                        <span className="opacity-40">#{o.id.slice(0, 6)} - {new Date(o.created_at).toLocaleDateString()}</span>
                                        <span className="font-black text-primary italic">{o.total.toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
