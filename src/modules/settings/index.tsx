"use client"

import { useState } from 'react'
import { useSettings } from './hooks/useSettings'
import { SettingsTabs } from './components/SettingsTabs'
import { GeneralTab } from './components/GeneralTab'
import { HoursTab } from './components/HoursTab'
import { DeliveryTab } from './components/DeliveryTab'
import { FeaturesTab } from './components/FeaturesTab'
import { PrintersTab } from './components/PrintersTab'
import { Upload, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const SettingsModule = () => {
    const [activeTab, setActiveTab] = useState("general")
    const {
        settings, setSettings,
        businessHours, setBusinessHours,
        loading, initialLoading, message,
        handleSaveGeneral,
        handleSaveHours,
        handleSaveDelivery,
        handleSaveFeatures,
        handleSavePrinters,
        handleSaveStripe
    } = useSettings()

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-muted-foreground">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">Gestiona los ajustes de tu negocio</p>
                </div>
                {message && (
                    <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg border border-green-500/20 font-medium animate-in fade-in slide-in-from-top-2">
                        {message}
                    </div>
                )}
            </div>

            <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="space-y-6">
                {activeTab === 'general' && (
                    <GeneralTab 
                        settings={settings} 
                        setSettings={setSettings} 
                        onSave={handleSaveGeneral} 
                        loading={loading} 
                    />
                )}
                {activeTab === 'hours' && (
                    <HoursTab 
                        businessHours={businessHours} 
                        setBusinessHours={setBusinessHours} 
                        onSave={handleSaveHours} 
                        loading={loading} 
                    />
                )}
                {activeTab === 'delivery' && (
                    <DeliveryTab 
                        settings={settings} 
                        setSettings={setSettings} 
                        onSave={handleSaveDelivery} 
                        loading={loading} 
                    />
                )}
                {activeTab === 'features' && (
                    <FeaturesTab 
                        settings={settings} 
                        setSettings={setSettings} 
                        onSave={handleSaveFeatures} 
                        onSaveStripe={handleSaveStripe}
                        loading={loading} 
                    />
                )}
                {activeTab === 'printers' && (
                    <PrintersTab 
                        settings={settings} 
                        setSettings={setSettings} 
                        onSave={handleSavePrinters} 
                        loading={loading} 
                    />
                )}
                {activeTab === 'instagram' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-pink-500/20">
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

                        <div className="bg-card border border-white/10 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 text-lg">Publicación Rápida</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="aspect-square bg-black rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground hover:border-pink-500/50 hover:text-pink-500 transition-all cursor-pointer group">
                                    <Upload className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                                    <span>Arrastra una foto aquí</span>
                                    <span className="text-xs mt-1">o haz clic para seleccionar</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pie de foto</label>
                                        <textarea
                                            className="w-full h-32 p-3 rounded-lg bg-white/5 border border-white/10 resize-none focus:border-pink-500 outline-none transition-colors"
                                            placeholder="¡Nueva hamburguesa disponible! 🍔🔥 #Pozu20 #BurgerLover"
                                        />
                                    </div>
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold">
                                        <Instagram className="w-4 h-4 mr-2" /> Publicar en Instagram
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
