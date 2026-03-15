import { useState } from "react"
import { X, Mail, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    onClose: () => void
    onSend: (email: string) => Promise<any>
    isSending: boolean
}

export const EmailModal = ({ onClose, onSend, isSending }: Props) => {
    const [emailAddress, setEmailAddress] = useState('')

    const handleSend = async () => {
        const result = await onSend(emailAddress)
        if (result.success) {
            alert('Email enviado correctamente!')
            onClose()
        } else {
            alert('Error al enviar email: ' + result.error)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Enviar Reporte</h3>
                        <p className="text-sm text-muted-foreground">Envía este resumen por correo electrónico</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Dirección de Email</label>
                        <input
                            type="email"
                            placeholder="ejemplo@pozu.com"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 font-bold"
                            onClick={handleSend}
                            disabled={isSending || !emailAddress}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Reporte
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
