import { Store, Phone, Mail, MapPin, CheckCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => void
    loading: boolean
}

export const GeneralTab = ({ settings, setSettings, onSave, loading }: Props) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                    <Store className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Información del Negocio</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Store className="w-4 h-4 text-muted-foreground" />
                            Nombre del Negocio
                        </label>
                        <input
                            value={settings.business_name}
                            onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            Teléfono de Contacto
                        </label>
                        <input
                            value={settings.phone}
                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Email de Contacto
                        </label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            Dirección
                        </label>
                        <input
                            value={settings.address}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                    <CheckCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Estado del Negocio</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <div className="font-bold">Estado Actual</div>
                            <div className="text-sm text-muted-foreground">Controla si aceptas pedidos</div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, is_open: !settings.is_open })}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.is_open ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.is_open ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className={`p-4 rounded-xl border ${settings.is_open ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className={`font-bold ${settings.is_open ? 'text-green-500' : 'text-red-500'}`}>
                            {settings.is_open ? '🟢 Abierto - Aceptando Pedidos' : '🔴 Cerrado - No aceptando pedidos'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {settings.is_open ? 'Los clientes pueden realizar pedidos' : 'Los clientes no pueden realizar pedidos'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <Button
                    onClick={onSave}
                    disabled={loading}
                    className="gap-2 bg-primary text-black font-bold px-8"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Guardar Cambios
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
