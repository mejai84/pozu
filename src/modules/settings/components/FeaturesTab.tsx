import { Store, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => void
    loading: boolean
}

export const FeaturesTab = ({ settings, setSettings, onSave, loading }: Props) => {
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

            <Button
                onClick={onSave}
                disabled={loading}
                className="gap-2 bg-primary text-black font-bold mt-6"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Guardar Funcionalidades
                    </>
                )}
            </Button>
        </div>
    )
}
