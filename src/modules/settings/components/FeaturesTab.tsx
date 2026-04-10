import { Store, Save, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => Promise<any> | void
    onSaveStripe?: () => Promise<any> | void
    loading: boolean
}

export const FeaturesTab = ({ settings, setSettings, onSave, onSaveStripe, loading }: Props) => {
    const handleSaveAll = async () => {
        await onSave()
        if (onSaveStripe) {
            await onSaveStripe()
        }
    }

    return (
        <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                <Store className="w-6 h-6" />
                <h3 className="text-xl font-bold">Funcionalidades del Sitio</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Combos en el Menú</div>
                        <div className="text-sm text-muted-foreground">Habilitar la sección de combos en la barra de navegación</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, enable_combos: !settings.enable_combos })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.enable_combos ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.enable_combos ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Reservas de Mesa</div>
                        <div className="text-sm text-muted-foreground">Habilitar el sistema de reservas y mostrarlo en el sitio web</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, reservations_enabled: !settings.reservations_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.reservations_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.reservations_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Pagos con Tarjeta (Stripe)</div>
                        <div className="text-sm text-muted-foreground">Permitir pagos online con tarjeta y Apple/Google Pay</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, online_payments_enabled: !settings.online_payments_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.online_payments_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.online_payments_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Pago en Efectivo</div>
                        <div className="text-sm text-muted-foreground">Permitir a los clientes pagar en efectivo al repartidor</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, cash_payments_enabled: !settings.cash_payments_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.cash_payments_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.cash_payments_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Tracking en Tiempo Real</div>
                        <div className="text-sm text-muted-foreground">Permitir a los clientes ver el estado de su pedido en vivo</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, tracking_enabled: !settings.tracking_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.tracking_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.tracking_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Recogida en Local (Takeaway)</div>
                        <div className="text-sm text-muted-foreground">Permitir a los clientes recoger su pedido en el restaurante</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, takeaway_enabled: !settings.takeaway_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.takeaway_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.takeaway_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <div className="font-bold">Servicio a Domicilio (Delivery)</div>
                        <div className="text-sm text-muted-foreground">Habilitar el reparto a domicilio</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, delivery_enabled: !settings.delivery_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.delivery_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.delivery_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-primary/10">
                    <div>
                        <div className="font-bold">Solicitar Firma en Entrega</div>
                        <div className="text-sm text-muted-foreground">Obligar al cliente a firmar en el móvil del repartidor</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, delivery_signature_enabled: !settings.delivery_signature_enabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.delivery_signature_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.delivery_signature_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div>
                        <div className="font-bold text-red-500">Modo Mantenimiento</div>
                        <div className="text-sm text-red-400/70">Desactivar pedidos y mostrar mensaje de mantenimiento</div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.maintenance_mode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 text-primary pb-3 pt-6 border-b border-white/10">
                <Key className="w-6 h-6" />
                <h3 className="text-xl font-bold">API Keys & Pagos</h3>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl space-y-4">
                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Stripe Publishable Key (pk_test_... o pk_live_...)</label>
                        <input
                            type="text"
                            value={settings.stripe_public_key || ""}
                            onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                            placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Stripe Secret Key (sk_test_... o sk_live_...)</label>
                        <input
                            type="password"
                            value={settings.stripe_secret_key || ""}
                            onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                            placeholder="Introduce nueva clave (ej: sk_test_123...)"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Estas claves determinan hacia dónde va el dinero de los pedidos. Asegúrate de poner las correctas. Se guardan de forma segura en la base de datos de tu proyecto.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleSaveAll}
                disabled={loading}
                className="gap-2 bg-primary text-black font-bold mt-6"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Guardar Funcionalidades y APIs
                    </>
                )}
            </Button>
        </div>
    )
}
