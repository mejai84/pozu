"use client"

import { useState, useEffect } from "react"
import { useCart } from "./cart-context"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'
import { CheckoutInnerForm } from "./checkout-inner-form"

export function CheckoutForm() {
    const { items, cartTotal } = useCart()
    const [user, setUser] = useState<any>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [finances, setFinances] = useState({ delivery_fee: 2.50, taxes_enabled: false, tax_percentage: 10 })

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: delivery } = await supabase.from('settings').select('*').eq('key', 'delivery_settings').single()
            if (delivery?.value) {
                setFinances({
                    delivery_fee: delivery.value.delivery_fee ?? 2.50,
                    taxes_enabled: delivery.value.taxes_enabled ?? false,
                    tax_percentage: delivery.value.tax_percentage ?? 10
                })
            }
        }
        fetchSettings()

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })
    }, [])

    useEffect(() => {
        // Crear PaymentIntent al montar si hay items
        if (items.length > 0) {
            const taxAmount = finances.taxes_enabled ? (cartTotal * (finances.tax_percentage / 100)) : 0
            const intentAmount = cartTotal + finances.delivery_fee + taxAmount

            fetch('/api/checkout/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: intentAmount }), 
            })
            .then(res => res.json())
            .then(data => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret)
                } else if (data.error) {
                    setError(data.error)
                }
            })
            .catch(err => {
                console.error("Error cargando Stripe:", err)
                setError("No se pudo conectar con la pasarela de pago.")
            })
        }
    }, [items, cartTotal, finances])

    if (items.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">Tu carrito está vacío.</div>
    }

    const appearance = {
        theme: 'night',
        variables: {
            fontFamily: 'system-ui, sans-serif',
            colorPrimary: '#eab308',
            colorBackground: '#1A1A1A',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            spacingUnit: '4px',
            borderRadius: '16px',
        },
    }

    return (
        <div className="grid md:grid-cols-2 gap-16">
            {/* Resumen */}
            <div className="space-y-10">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white">Resumen del <span className="text-primary">Pedido</span></h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Revisa tu artillería antes de atacar</p>
                </div>

                <div className="space-y-8 bg-[#0E0E0E] p-10 rounded-[48px] border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4 no-scrollbar relative z-10">
                        {items.map(item => (
                            <div key={item.uniqueId} className="flex justify-between items-center group/item">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-primary text-lg group-hover/item:border-primary/30 transition-all">
                                        {item.quantity}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black italic uppercase text-lg text-white group-hover/item:text-primary transition-colors">{item.name}</span>
                                        {item.options && (
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-primary/60 italic">{item.options}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-black text-xl italic text-white/40 group-hover/item:text-white transition-colors">{(item.price * item.quantity).toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-white/5 pt-8 mt-4 space-y-4 relative z-10">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            <span>Base del pedido</span>
                            <span className="text-white italic">{cartTotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            <span>Gastos de envío</span>
                            <span className="text-white italic">{finances.delivery_fee.toFixed(2)}€</span>
                        </div>
                        {finances.taxes_enabled && (
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>IVA ({finances.tax_percentage}%)</span>
                                <span className="text-white italic">{(cartTotal * (finances.tax_percentage / 100)).toFixed(2)}€</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-8 mt-4 border-t-2 border-primary/20">
                            <span className="text-xl font-black italic text-white uppercase tracking-tighter">TOTAL A PAGAR</span>
                            <div className="flex flex-col items-end">
                                <span className="text-5xl font-black italic text-primary tracking-tighter drop-shadow-[0_10px_20px_rgba(234,179,8,0.2)]">
                                    {(cartTotal + finances.delivery_fee + (finances.taxes_enabled ? (cartTotal * (finances.tax_percentage / 100)) : 0)).toFixed(2)}€
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">IVA INCLUIDO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario con Stripe Elements */}
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Completar <span className="text-gradient">Pago</span></h2>
                    {!user && (
                        <Link href="/login" className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase border border-primary/20 hover:bg-primary hover:text-black transition-all">
                            Ya tengo cuenta
                        </Link>
                    )}
                </div>

                {clientSecret ? (
                     <Elements 
                        stripe={stripePromise} 
                        options={{ 
                            clientSecret, 
                            appearance: appearance as any,
                            locale: 'es',
                            loader: 'auto',
                        }}
                    >
                        <CheckoutInnerForm user={user} />
                    </Elements>
                ) : error ? (
                    <div className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 backdrop-blur-md text-center py-10">
                        <p className="text-red-500 font-bold mb-2">Error de Configuración</p>
                        <p className="text-sm text-red-500/80">{error}</p>
                        <p className="text-xs text-muted-foreground mt-4 italic">
                            Asegúrate de configurar las claves de Stripe en el panel de control.
                        </p>
                    </div>
                ) : (
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md text-center py-20 text-muted-foreground animate-pulse">
                        Cargando entorno seguro de pago...
                    </div>
                )}
            </div>
        </div>
    )
}
