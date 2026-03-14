"use client"

import { useState } from "react"
import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

export function CheckoutInnerForm({ user }: { user: any }) {
    const { items, cartTotal, clearCart } = useCart()
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const deliveryFee = 2.50
            const total = cartTotal + deliveryFee

            // 1. Guardar o preparar pago Stripe
            if (paymentMethod === 'stripe') {
                if (!stripe || !elements) {
                    throw new Error("Stripe no está inicializado")
                }
                
                // Confirmar pago con Stripe primero (redirigirá o devolverá error)
                // Usamos redirect: "if_required" para no redirigir si no fue 3D secure u otro método asíncrono.
                const { error: submitError } = await elements.submit()
                if (submitError) {
                     throw new Error(submitError.message)
                }

                const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    redirect: 'if_required',
                })

                if (confirmError) {
                    throw new Error(confirmError.message)
                }
            }

            // 2. Insert Order en Supabase
            const orderData = {
                user_id: user?.id || null,
                guest_info: user ? null : {
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone
                },
                status: 'pending',
                order_type: 'delivery',
                delivery_address: {
                    street: formData.address,
                    city: formData.city,
                    phone: formData.phone
                },
                subtotal: cartTotal,
                delivery_fee: deliveryFee,
                total: total,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'stripe' ? 'paid' : 'pending',
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single()

            if (orderError) throw new Error(orderError.message)

            const orderItems = items.map(item => {
                const isRealProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
                return {
                    order_id: order.id,
                    product_id: isRealProduct ? item.id : null,
                    quantity: item.quantity,
                    unit_price: item.price,
                    customizations: {
                        name: item.name,
                        mock_id: !isRealProduct ? item.id : null,
                        notes: item.options || null
                    }
                }
            })

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw new Error(itemsError.message)

            clearCart()
            router.push('/checkout/success')

        } catch (error: any) {
            console.error(error)
            alert("Error al procesar el pedido: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleCheckout} className="space-y-8 p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                    <input name="firstName" onChange={handleInputChange} placeholder="Rockstar" className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 outline-none transition-all font-medium" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Apellidos</label>
                    <input name="lastName" onChange={handleInputChange} placeholder="Pozu" className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 outline-none transition-all font-medium" required />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Dirección de Entrega</label>
                <input name="address" onChange={handleInputChange} placeholder="Calle Río Cares, 2..." className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 outline-none transition-all font-medium" required />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Ciudad</label>
                    <input name="city" onChange={handleInputChange} placeholder="Pola de Laviana" className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 outline-none transition-all font-medium" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</label>
                    <input name="phone" onChange={handleInputChange} placeholder="600 000 000" className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 outline-none transition-all font-medium" required />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Método de Pago</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'stripe' 
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,184,0,0.1)]' 
                            : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:border-white/10'}`}
                    >
                        <CreditCard className="w-8 h-8" />
                        <span className="font-bold uppercase tracking-tighter">Tarjeta / Apple Pay</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cash' 
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,184,0,0.1)]' 
                            : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:border-white/10'}`}
                    >
                        <Banknote className="w-8 h-8" />
                        <span className="font-bold uppercase tracking-tighter">Efectivo al Repartidor</span>
                    </button>
                </div>
            </div>

            {paymentMethod === 'stripe' && (
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white">
                    <PaymentElement options={{ layout: 'tabs' }} />
                </div>
            )}

            <Button 
                type="submit" 
                className="w-full h-20 text-2xl font-black uppercase tracking-tighter italic shadow-[0_0_30px_rgba(255,184,0,0.3)] hover:shadow-[0_0_50px_rgba(255,184,0,0.5)] transition-all rounded-2xl" 
                disabled={loading || (paymentMethod === 'stripe' && !stripe)}
            >
                {loading ? <Loader2 className="animate-spin w-8 h-8" /> : `Pagar y Pedir ${(cartTotal + 2.50).toFixed(2)}€`}
            </Button>
        </form>
    )
}
