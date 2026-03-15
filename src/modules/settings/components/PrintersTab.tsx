import { Printer, Plus, Trash2, Wifi, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Settings, PrinterConfig } from "../types"

interface Props {
    settings: Settings
    setSettings: (s: Settings) => void
    onSave: () => void
    loading: boolean
}

export const PrintersTab = ({ settings, setSettings, onSave, loading }: Props) => {
    const addPrinter = () => {
        const newNode: PrinterConfig = {
            id: Date.now().toString(),
            name: "NUEVA IMPRESORA",
            type: "kitchen",
            connection: "network",
            paper_size: "80mm"
        }
        setSettings({
            ...settings,
            printers: [...settings.printers, newNode]
        })
    }

    const updatePrinter = (id: string, updates: Partial<PrinterConfig>) => {
        setSettings({
            ...settings,
            printers: settings.printers.map(p => p.id === id ? { ...p, ...updates } : p)
        })
    }

    const removePrinter = (id: string) => {
        setSettings({
            ...settings,
            printers: settings.printers.filter(p => p.id !== id)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-primary">
                    <Printer className="w-6 h-6" />
                    <h3 className="text-xl font-bold italic uppercase tracking-tighter">Hardware Bridge</h3>
                </div>
                <Button 
                    onClick={addPrinter}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black gap-2"
                    size="sm"
                >
                    <Plus className="w-4 h-4" /> Vincular Terminal
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {settings.printers.map((printer) => (
                    <div key={printer.id} className="bg-card border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700">
                            <Printer className="w-32 h-32" />
                        </div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <Printer className="w-6 h-6" />
                                </div>
                                <input 
                                    value={printer.name}
                                    onChange={(e) => updatePrinter(printer.id, { name: e.target.value.toUpperCase() })}
                                    className="bg-transparent border-none p-0 text-xl font-black italic uppercase tracking-tighter w-full focus:ring-0 outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => removePrinter(printer.id)}
                                className="p-2 text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Zona</label>
                                <select 
                                    value={printer.type}
                                    onChange={(e) => updatePrinter(printer.id, { type: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                >
                                    <option value="cashier">Facturación</option>
                                    <option value="kitchen">Cocina</option>
                                    <option value="bar">Bar</option>
                                    <option value="other">Otros</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Conexión</label>
                                <select 
                                    value={printer.connection}
                                    onChange={(e) => updatePrinter(printer.id, { connection: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                >
                                    <option value="usb">USB Local</option>
                                    <option value="network">LAN / Red</option>
                                    <option value="bluetooth">Bluetooth</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Papel</label>
                                <select 
                                    value={printer.paper_size}
                                    onChange={(e) => updatePrinter(printer.id, { paper_size: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-primary/50"
                                >
                                    <option value="80mm">80mm Pro</option>
                                    <option value="58mm">58mm Lite</option>
                                </select>
                            </div>
                            {printer.connection === 'network' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Dirección IP</label>
                                    <div className="relative">
                                        <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground opacity-40" />
                                        <input 
                                            value={printer.target_ip || ""}
                                            placeholder="192.168.1..."
                                            onChange={(e) => updatePrinter(printer.id, { target_ip: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 text-xs font-mono outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {settings.printers.length === 0 && (
                    <div className="md:col-span-2 py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                        <Printer className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                        <div className="space-y-1">
                            <p className="font-bold text-muted-foreground">No hay impresoras configuradas</p>
                            <p className="text-xs text-muted-foreground/60">Vincule una terminal para habilitar la impresión de tickets</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6">
                <Button
                    onClick={onSave}
                    disabled={loading}
                    className="h-16 px-10 bg-primary text-black font-black uppercase italic rounded-2xl shadow-xl hover:bg-primary/80 transition-all gap-3"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                        <>
                            <Save className="w-5 h-5" /> GUARDAR ARQUITECTURA
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
