"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, X, Loader2, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignatureCanvas } from "./SignatureCanvas"
import { DeliveryOrder } from "../types"
import { supabase } from "@/lib/supabase/client"

interface Props {
    order: DeliveryOrder
    onClose: () => void
    onConfirmDelivery: (signatureUrl: string | null) => void
}

export const DeliverySignatureModal = ({ order, onClose, onConfirmDelivery }: Props) => {
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const uploadSignature = async (): Promise<string | null> => {
        if (!signatureDataUrl) return null
        // Convert dataURL to Blob
        const res = await fetch(signatureDataUrl)
        const blob = await res.blob()
        const path = `signatures/${order.id}/${Date.now()}.png`
        const { error: err } = await supabase.storage
            .from('incidents-photos')
            .upload(path, blob, { contentType: 'image/png', upsert: true })
        if (err) return null
        const { data } = supabase.storage.from('incidents-photos').getPublicUrl(path)
        return data.publicUrl
    }

    const handleConfirm = async () => {
        setUploading(true)
        setError(null)
        const signatureUrl = await uploadSignature()
        onConfirmDelivery(signatureUrl)
        setUploading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#111111] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-y-auto max-h-[95vh] shadow-2xl no-scrollbar"
            >
                {/* Header */}
                <div className="p-6 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-500/5 sticky top-0 z-20 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <PenLine className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Confirmar Entrega</h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                Pedido #{order.id.split('-')[0].toUpperCase()} · Total: {order.total.toFixed(2)}€
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Resumen de entrega */}
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Destino de Entrega</p>
                        <p className="font-black italic uppercase text-white text-lg">
                            {typeof order.delivery_address === 'string' 
                                ? order.delivery_address 
                                : order.delivery_address?.street || 'Dirección no especificada'}
                        </p>
                    </div>

                    {/* Firma */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <PenLine className="w-3.5 h-3.5 text-primary" />
                                Firma del Receptor
                            </label>
                            <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest italic">Opcional</span>
                        </div>
                        <SignatureCanvas 
                            onSignatureChange={setSignatureDataUrl}
                            width={500}
                            height={180}
                        />
                        {signatureDataUrl && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Firma capturada</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-xs font-bold text-red-400 text-center">{error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                    <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl font-black uppercase italic text-xs h-14 border border-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={uploading}
                        className="flex-[2] rounded-2xl bg-emerald-600 text-white font-black uppercase italic tracking-tighter h-14 hover:bg-emerald-700 shadow-xl shadow-emerald-500/10 disabled:opacity-40"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</span>
                        ) : (
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Confirmar Entrega</span>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
