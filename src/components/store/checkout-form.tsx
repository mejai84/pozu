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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })

        // Crear PaymentIntent al montar si hay items
        if (items.length > 0) {
            fetch('/api/checkout/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: cartTotal + 2.50 }), // base + envio
            })
            .then(res => res.json())
            .then(data => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret)
                }
            })
            .catch(err => console.error("Error cargando Stripe:", err))
        }
    }, [items, cartTotal])

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
        <div className="grid md:grid-cols-2 gap-12">
            {/* Resumen */}
            <div className="space-y-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Resumen del <span className="text-gradient">Pedido</span></h2>
                <div className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md shadow-xl">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {items.map(item => (
                            <div key={item.uniqueId} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                                        {item.quantity}x
                                    </div>
                                    <span className="font-bold text-lg">{item.name}</span>
                                </div>
                                <span className="font-bold text-muted-foreground">{(item.price * item.quantity).toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                        <div className="flex justify-between text-muted-foreground font-medium">
                            <span>Base del pedido</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground font-medium">
                            <span>Gastos de envío</span>
                            <span>2.50€</span>
                        </div>
                        <div className="flex justify-between text-3xl font-black pt-6 border-t border-white/10 text-primary uppercase italic tracking-tighter">
                            <span>Total</span>
                            <span>{(cartTotal + 2.50).toFixed(2)}€</span>
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
                            appearance: appearance as any 
                        }}
                    >
                        <CheckoutInnerForm user={user} />
                    </Elements>
                ) : (
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md text-center py-20 text-muted-foreground animate-pulse">
                        Cargando entorno seguro de pago...
                    </div>
                )}
            </div>
        </div>
    )
}
