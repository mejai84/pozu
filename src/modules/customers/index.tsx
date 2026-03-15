"use client"

import { Users, Search, Loader2, Star, ExternalLink, Trash2, MessageCircle } from "lucide-react"
import { useState } from "react"
import { useCustomers } from "./hooks/useCustomers"
import { CustomerTag } from "./components/CustomerTag"
import { CustomerDetailsModal } from "./components/CustomerDetailsModal"
import { Customer } from "./types"

export const CustomersModule = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<'all' | 'vip' | 'loyal' | 'new' | 'risk'>('all')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    
    const { 
        customers, 
        loading, 
        crmMetadata, 
        savingNotes, 
        handleSaveNotes, 
        handleDeleteCustomer 
    } = useCustomers(searchTerm, filterType)

    const openWhatsApp = (phone: string, name: string) => {
        const cleanPhone = phone.replace(/\s+/g, '')
        const msg = encodeURIComponent(`¡Hola ${name}! Te escribimos de Pozu 2.0. Tenemos una oferta especial para ti...`)
        window.open(`https://wa.me/34${cleanPhone}?text=${msg}`, '_blank')
    }

    const onSaveNotesWrapper = async (phone: string, notes: string) => {
        const success = await handleSaveNotes(phone, notes)
        if (success) alert("Notas guardadas")
        else alert("Error al guardar notas")
        return success
    }

    const onDeleteWrapper = async (phone: string) => {
        if (!confirm("¿Seguro? Se anonimizarán los pedidos.")) return
        const success = await handleDeleteCustomer(phone)
        if (!success) alert("Error al eliminar")
    }

    return (
        <div className="space-y-4 pb-10 max-w-[1400px] mx-auto text-sm px-4">
            {/* Header Compacto */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#1A1A1A] p-4 rounded-xl border border-white/10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">CRM <span className="text-primary">Pozu</span></h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Base de Datos Inteligente</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        {['all', 'vip', 'loyal', 'risk'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilterType(t as any)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${filterType === t ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                            >
                                {t === 'risk' ? 'Riesgo' : t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 pl-10 outline-none focus:ring-1 focus:ring-primary/40 font-bold text-sm"
                    placeholder="Buscar por nombre, tel o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                                <th className="p-4">Cliente / Contacto</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Puntos</th>
                                <th className="p-4 text-right">Gasto</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /></td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground italic text-xs">No se encontraron clientes</td></tr>
                            ) : customers.map((c, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors text-xs">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center font-black text-primary border border-primary/10">{c.name.charAt(0)}</div>
                                            <div>
                                                <div className="font-bold">{c.name}</div>
                                                <div className="text-[10px] opacity-40 font-mono">{c.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <CustomerTag customer={c} />
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-black text-primary italic">
                                            <Star className="w-3 h-3 fill-primary" /> {c.points}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-black italic">{c.totalSpent.toFixed(2)}€</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button onClick={() => openWhatsApp(c.phone, c.name)} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="WhatsApp">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setSelectedCustomer(c)} className="p-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all" title="Detalles">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => onDeleteWrapper(c.phone)} className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all" title="Eliminar">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCustomer && (
                <CustomerDetailsModal 
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onSaveNotes={onSaveNotesWrapper}
                    savingNotes={savingNotes}
                    initialNotes={crmMetadata[selectedCustomer.phone]?.notes || ""}
                />
            )}
        </div>
    )
}
