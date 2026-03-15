import { Truck, DollarSign, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => void
    loading: boolean
}

export const DeliveryTab = ({ settings, setSettings, onSave, loading }: Props) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-primary pb-3 border-b border-white/10">
                    <Truck className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Configuración de Delivery</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            Costo de Envío (€)
                        </label>
                        <input
                            type="number"
                            step="0.50"
                            value={settings.delivery_fee}
                            onChange={(e) => setSettings({ ...settings, delivery_fee: parseFloat(e.target.value) })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            Pedido Mínimo (€)
                        </label>
                        <input
                            type="number"
                            step="1.00"
                            value={settings.min_order_amount}
                            onChange={(e) => setSettings({ ...settings, min_order_amount: parseFloat(e.target.value) })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4">Vista Previa</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-black/30 rounded-lg">
                        <span>Subtotal</span>
                        <span className="font-mono">15.00€</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-lg">
                        <span>Costo de Envío</span>
                        <span className="font-mono text-primary font-bold">{settings.delivery_fee.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between p-3 bg-primary/20 rounded-lg border border-primary/30">
                        <span className="font-bold">Total</span>
                        <span className="font-mono font-bold">{(15 + settings.delivery_fee).toFixed(2)}€</span>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs">
                        💡 Pedido mínimo: {settings.min_order_amount.toFixed(2)}€
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <Button
                    onClick={onSave}
                    disabled={loading}
                    className="gap-2 bg-primary text-black font-bold"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Guardar Configuración de Delivery
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
