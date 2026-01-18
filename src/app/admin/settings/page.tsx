
"use client"

import { Button } from "@/components/ui/button"
import { Instagram, Save, Upload, Store } from "lucide-react"
import { useState } from "react"

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general")

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Configuración</h1>

            {/* Tabs Header */}
            <div className="flex border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab("instagram")}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'instagram' ? 'border-pink-500 text-pink-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Instagram
                </button>
                <button
                    onClick={() => setActiveTab("hours")}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'hours' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Horarios
                </button>
            </div>

            {/* Content */}
            <div className="bg-card border border-white/10 rounded-2xl p-8">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5" /> Información del Restaurante
                            </h3>
                            <div className="grid gap-4 max-w-lg">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre del Negocio</label>
                                    <input defaultValue="Pozu 2.0" className="w-full p-3 rounded-lg bg-white/5 border border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Teléfono de Contacto</label>
                                    <input defaultValue="+34 600 000 000" className="w-full p-3 rounded-lg bg-white/5 border border-white/10" />
                                </div>
                            </div>
                        </div>
                        <Button className="gap-2 bg-primary text-white">
                            <Save className="w-4 h-4" /> Guardar Cambios
                        </Button>
                    </div>
                )}

                {activeTab === 'instagram' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-pink-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center p-1">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                        <Instagram className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Conexión con Instagram</h3>
                                    <p className="text-sm text-pink-200/70">Publica tus productos directamente en tu feed.</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-pink-500/50 hover:bg-pink-500/20 text-pink-500">
                                Conectar Cuenta
                            </Button>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">Publicación Rápida</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="aspect-square bg-black rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                                    <Upload className="w-10 h-10 mb-2" />
                                    <span>Arrastra una foto aquí</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pie de foto</label>
                                        <textarea
                                            className="w-full h-32 p-3 rounded-lg bg-white/5 border border-white/10 resize-none"
                                            placeholder="¡Nueva hamburguesa disponible! 🍔🔥 #Pozu20 #BurgerLover"
                                        />
                                    </div>
                                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold">
                                        <Instagram className="w-4 h-4 mr-2" /> Publicar Ahora
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
