"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, X, Camera, ImageIcon, UploadCloud, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeliveryOrder, DeliveryIncident } from "../types"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Props {
    order: DeliveryOrder
    onClose: () => void
    onReport: (id: string, incident: DeliveryIncident) => void
}

const INCIDENT_TYPES = [
    { id: 'not_found', label: '🗺️ Dirección No Encontrada', desc: 'No puedo localizar la calle o número' },
    { id: 'client_absent', label: '🚪 Cliente Ausente', desc: 'No contesta ni teléfono ni puerta' },
    { id: 'wrong_address', label: '📍 Dirección Errónea', desc: 'La dirección está mal introducida' },
    { id: 'damage', label: '💥 Pedido Dañado', desc: 'El producto tuvo un accidente en tránsito' },
    { id: 'other', label: '⚠️ Otro Problema', desc: 'Incidencia no contemplada' }
]

export const DeliveryIncidentModal = ({ order, onClose, onReport }: Props) => {
    const [type, setType] = useState<DeliveryIncident['type']>('other')
    const [desc, setDesc] = useState("")
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handlePhotoSelect = (file: File) => {
        setPhoto(file)
        const reader = new FileReader()
        reader.onload = (e) => setPhotoPreview(e.target?.result as string)
        reader.readAsDataURL(file)
    }

    const uploadPhoto = async (): Promise<string | undefined> => {
        if (!photo) return undefined
        const ext = photo.name.split('.').pop()
        const path = `incidents/${order.id}/${Date.now()}.${ext}`
        const { error: err } = await supabase.storage
            .from('incidents-photos')
            .upload(path, photo, { upsert: true })
        if (err) {
            console.error('Upload error', err)
            return undefined
        }
        const { data } = supabase.storage.from('incidents-photos').getPublicUrl(path)
        return data.publicUrl
    }

    const handleSubmit = async () => {
        if (!desc) { setError("Por favor, describe el incidente brevemente."); return }
        setUploading(true)
        setError(null)
        
        const photoUrl = await uploadPhoto()

        onReport(order.id, {
            type,
            description: desc,
            timestamp: new Date().toISOString(),
            photo_url: photoUrl
        })
        setUploading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="bg-[#111111] border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl my-auto"
            >
                {/* Header */}
                <div className="p-8 border-b border-red-500/20 flex items-center justify-between bg-red-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Registrar Incidencia</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pedido #{order.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Tipo de Incidencia */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de Problema</label>
                        <div className="space-y-2">
                            {INCIDENT_TYPES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setType(t.id as any)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border text-left transition-all",
                                        type === t.id 
                                            ? 'bg-red-500/10 border-red-500 shadow-inner' 
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={cn("font-black text-sm", type === t.id ? "text-red-400" : "text-white")}>{t.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                                        </div>
                                        {type === t.id && <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción del Problema</label>
                        <textarea 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-500/50 outline-none min-h-[100px] text-white resize-none"
                            placeholder="Ej: El telefonillo no funciona y el cliente no coge el móvil desde hace 5 minutos..."
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>

                    {/* Foto de Evidencia */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5 text-primary" />
                            Foto de Evidencia <span className="text-muted-foreground/40">(opcional)</span>
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) handlePhotoSelect(f)
                            }}
                        />

                        {photoPreview ? (
                            <div className="relative group">
                                <img 
                                    src={photoPreview} 
                                    alt="Preview" 
                                    className="w-full max-h-56 object-cover rounded-2xl border border-white/10"
                                />
                                <button 
                                    onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                                    className="absolute top-3 right-3 p-2 bg-black/80 rounded-xl border border-white/10 hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Foto lista</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-3 h-24 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                                >
                                    <Camera className="w-6 h-6 text-primary" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Cámara</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.removeAttribute('capture')
                                            fileInputRef.current.click()
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center gap-3 h-24 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                                >
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Galería</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-xs font-bold text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                    <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl font-black uppercase italic text-xs h-14 border border-white/5">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="flex-[2] rounded-2xl bg-red-600 text-white font-black uppercase italic tracking-tighter h-14 hover:bg-red-700 shadow-xl shadow-red-600/10 disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Subiendo evidencia...</span>
                        ) : (
                            <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Registrar Incidencia</span>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
