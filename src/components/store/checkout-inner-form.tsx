"use client"

import { useState } from "react"
import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Banknote, MapPin, Phone, User as UserIcon, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function CheckoutInnerForm({ user }: { user: any }) {
    const { items, cartTotal, clearCart } = useCart()
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [enabledPayments, setEnabledPayments] = useState({ online: true, cash: true })
    const [finances, setFinances] = useState({ delivery_fee: 2.50, taxes_enabled: false, tax_percentage: 10 })
    const router = useRouter()

    // Cargar configuraciones desde la DB
    useState(() => {
        const fetchSettings = async () => {
            // Flags de funcionalidades
            const { data: flags } = await supabase.from('settings').select('*').eq('key', 'feature_flags').single()
            if (flags?.value) {
                const { online_payments_enabled, cash_payments_enabled } = flags.value
                setEnabledPayments({ 
                    online: online_payments_enabled ?? true, 
                    cash: cash_payments_enabled ?? true 
                })
                if (online_payments_enabled === false) setPaymentMethod('cash')
                else if (cash_payments_enabled === false) setPaymentMethod('stripe')
            }

            // Finanzas y Delivery
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
    })

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
            const deliveryFee = finances.delivery_fee
            const taxAmount = finances.taxes_enabled ? (cartTotal * (finances.tax_percentage / 100)) : 0
            const total = cartTotal + deliveryFee + taxAmount

            let stripeDetails = {}
            if (paymentMethod === 'stripe') {
                if (!stripe || !elements) throw new Error("Stripe no está inicializado")

                const { error: submitError } = await elements.submit()
                if (submitError) throw new Error(submitError.message)

                const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    redirect: 'if_required',
                })

                if (confirmError) throw new Error(confirmError.message)

                if (paymentIntent) {
                    stripeDetails = {
                        stripe_payment_id: paymentIntent.id,
                        payment_metadata: {
                            status: paymentIntent.status,
                            currency: paymentIntent.currency,
                            amount: paymentIntent.amount
                        }
                    }
                }
            }

            const orderData = {
                user_id: user?.id || null,
                guest_info: user ? null : {
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone
                },
                status: paymentMethod === 'stripe' ? 'confirmed' : 'pending',
                order_type: 'delivery',
                delivery_address: {
                    street: formData.address,
                    city: formData.city,
                    phone: formData.phone
                },
                subtotal: cartTotal,
                delivery_fee: deliveryFee,
                tax_amount: taxAmount,
                total: total,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'stripe' ? 'paid' : 'pending',
                source: 'web',
                ...stripeDetails
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
            router.push(`/checkout/success?id=${order.id}`)

        } catch (error: any) {
            console.error(error)
            alert("Error al procesar el pedido: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleCheckout} className="space-y-12">
            {/* Step 1: Delivery Details */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Detalles de Entrega</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">¿A dónde enviamos la artillería?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Nombre</label>
                        <div className="relative">
                            <input name="firstName" onChange={handleInputChange} placeholder="Rockstar" className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/10" required />
                            <UserIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary/40" />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Apellidos</label>
                        <div className="relative">
                            <input name="lastName" onChange={handleInputChange} placeholder="Pozu" className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/10" required />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Dirección de Entrega</label>
                    <div className="relative">
                        <input name="address" onChange={handleInputChange} placeholder="Calle Río Cares, 2..." className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/10" required />
                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary/40" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Ciudad</label>
                        <input name="city" onChange={handleInputChange} placeholder="Pola de Laviana" className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/10" required />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Teléfono</label>
                        <div className="relative">
                            <input name="phone" onChange={handleInputChange} placeholder="600 000 000" className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full focus:ring-2 focus:ring-primary/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/10" required />
                            <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary/40" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Método de Pago</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Pago 100% seguro y encriptado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enabledPayments.online && (
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('stripe')}
                            className={`group p-8 rounded-3xl border-2 flex flex-col items-start gap-4 transition-all relative overflow-hidden ${paymentMethod === 'stripe'
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_10px_30px_rgba(234,179,8,0.1)]'
                                : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                        >
                            <CreditCard className={cn("w-10 h-10 transition-transform group-hover:scale-110", paymentMethod === 'stripe' ? 'text-primary' : 'text-white/20')} />
                            <div className="text-left">
                                <span className="block font-black italic uppercase tracking-tighter text-lg leading-none">Tarjeta / Apple Pay</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Checkout Instantáneo</span>
                            </div>
                            {paymentMethod === 'stripe' && (
                                <motion.div layoutId="paymentGlow" className="absolute -inset-4 bg-primary/5 blur-3xl pointer-events-none" />
                            )}
                        </button>
                    )}
                    
                    {enabledPayments.cash && (
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`group p-8 rounded-3xl border-2 flex flex-col items-start gap-4 transition-all relative overflow-hidden ${paymentMethod === 'cash'
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_10px_30px_rgba(234,179,8,0.1)]'
                                : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                        >
                            <Banknote className={cn("w-10 h-10 transition-transform group-hover:scale-110", paymentMethod === 'cash' ? 'text-primary' : 'text-white/20')} />
                            <div className="text-left">
                                <span className="block font-black italic uppercase tracking-tighter text-lg leading-none">Efectivo al Repartidor</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Paga al recibir</span>
                            </div>
                            {paymentMethod === 'cash' && (
                                <motion.div layoutId="paymentGlow" className="absolute -inset-4 bg-primary/5 blur-3xl pointer-events-none" />
                            )}
                        </button>
                    )}

                    {!enabledPayments.online && !enabledPayments.cash && (
                        <div className="col-span-full p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                            <p className="font-bold text-red-500">Lo sentimos, no hay métodos de pago disponibles en este momento.</p>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {paymentMethod === 'stripe' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden relative"
                        >
                            <PaymentElement options={{ layout: 'accordion' }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Total & Submit */}
            <div className="pt-8 space-y-4">
                <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary to-yellow-600 shadow-[0_20px_60px_rgba(234,179,8,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <button
                        type="submit"
                        className="w-full flex items-center justify-between group/btn disabled:opacity-50"
                        disabled={loading || (paymentMethod === 'stripe' && !stripe) || !acceptedTerms}
                    >
                        <div className="text-left text-black">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">Finalizar mi pedido</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                {loading ? 'PROCESANDO...' : `PAGAR ${(cartTotal + finances.delivery_fee + (finances.taxes_enabled ? cartTotal * (finances.tax_percentage / 100) : 0)).toFixed(2)}€`}
                            </h3>
                            {finances.taxes_enabled && (
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Incluye {finances.tax_percentage}% IVA ({(cartTotal * (finances.tax_percentage / 100)).toFixed(2)}€)</p>
                            )}
                        </div>
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl group-hover/btn:scale-110 transition-transform">
                            {loading ? (
                                <Loader2 className="animate-spin w-8 h-8 text-primary" />
                            ) : (
                                <ArrowRight className="w-8 h-8 text-primary group-hover/btn:translate-x-1 transition-transform" />
                            )}
                        </div>
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 py-2 cursor-pointer group/terms" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                    <div className={cn(
                        "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                        acceptedTerms ? "bg-primary border-primary" : "border-white/20 bg-white/5 group-hover/terms:border-primary/50"
                    )}>
                        {acceptedTerms && <ShieldCheck className="w-3 h-3 text-black" />}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">
                        Acepto las <Link href="/terminos" className="text-primary hover:underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>Condiciones de Servicio</Link> y <Link href="/privacidad" className="text-primary hover:underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>Política de Privacidad</Link>.
                    </p>
                </div>
            </div>
        </form>
    )
}
