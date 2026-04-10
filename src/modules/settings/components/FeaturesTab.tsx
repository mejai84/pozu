import { Store, Save, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => Promise<any> | void
    onSaveStripe?: () => Promise<any> | void
    onSaveAdmin?: () => Promise<any> | void
    loading: boolean
}

export const FeaturesTab = ({ settings, setSettings, onSave, onSaveStripe, onSaveAdmin, loading }: Props) => {
    const handleSaveAll = async () => {
        await onSave()
        if (onSaveStripe) await onSaveStripe()
        if (onSaveAdmin) await onSaveAdmin()
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
                <h3 className="text-xl font-bold">API Keys & Pagos Multigates</h3>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl space-y-4">
                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Pasarela de Pago Activa</label>
                        <select 
                            value={settings.active_gateway || 'stripe'}
                            onChange={(e) => setSettings({ ...settings, active_gateway: e.target.value as any })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                        >
                            <option value="stripe">Stripe (Tarjetas de Crédito, Apple/Google Pay)</option>
                            <option value="mercadopago">MercadoPago (Latam)</option>
                            <option value="paypal">PayPal</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-2">
                            Selecciona por qué plataforma procesarás los cobros cuando los clientes soliciten pago online.
                        </p>
                    </div>

                    {settings.active_gateway === 'stripe' && (
                        <div className="pt-4 space-y-4 border-t border-white/10 mt-4">
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
                        </div>
                    )}

                    {settings.active_gateway === 'mercadopago' && (
                        <div className="pt-4 space-y-4 border-t border-white/10 mt-4">
                            <div>
                                <label className="text-sm font-bold text-white mb-2 block">MercadoPago Access Token (APP_USR-...)</label>
                                <input
                                    type="password"
                                    value={settings.mercadopago_access_token || ""}
                                    onChange={(e) => setSettings({ ...settings, mercadopago_access_token: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                            </div>
                            <p className="text-xs text-blue-400">
                                Las credenciales de Producción en MercadoPago requieren ser generadas en la sección "Tus Integraciones" del panel de MP.
                            </p>
                        </div>
                    )}

                    {settings.active_gateway === 'paypal' && (
                        <div className="pt-4 space-y-4 border-t border-white/10 mt-4">
                            <div>
                                <label className="text-sm font-bold text-white mb-2 block">PayPal Client ID</label>
                                <input
                                    type="text"
                                    value={settings.paypal_client_id || ""}
                                    onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="AaBbCcDdEeFf..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white mb-2 block">PayPal Secret Key</label>
                                <input
                                    type="password"
                                    value={settings.paypal_secret || ""}
                                    onChange={(e) => setSettings({ ...settings, paypal_secret: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Introduce el secret key de PayPal..."
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4 block">
                        Estas claves determinan hacia dónde va el dinero de los pedidos. Asegúrate de poner las correctas. Se guardan de forma segura en la base de datos de tu proyecto.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 text-primary pb-3 pt-6 border-b border-white/10">
                <Store className="w-6 h-6" />
                <h3 className="text-xl font-bold">Gestión por Chat (Admin)</h3>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Gestiona tu restaurante directamente desde WhatsApp o Telegram usando comandos especiales protegidos por un PIN.
                    </p>
                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">PIN de Administrador (Código Secreto)</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={settings.admin_pin || ""}
                            onChange={(e) => setSettings({ ...settings, admin_pin: e.target.value })}
                            className="w-full max-w-[200px] bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors text-center font-mono text-2xl tracking-[0.5em]"
                            placeholder="1234"
                        />
                    </div>
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
