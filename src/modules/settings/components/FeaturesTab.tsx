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
