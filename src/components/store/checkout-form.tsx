
"use client"

import { useState } from "react"
import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useEffect } from "react"

export function CheckoutForm() {
    const { items, cartTotal, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })
    }, [])

    // Form fields
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
            // 1. Get current user (can be null for guests)
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user

            // 2. Prepare Order Data
            const deliveryFee = 2.50
            const total = cartTotal + deliveryFee

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
                payment_status: paymentMethod === 'cash' ? 'pending' : 'paid', // Simulating paid for stripe
            }

            // 3. Insert Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single()

            if (orderError) throw new Error(orderError.message)

            // 4. Insert Order Items
            const orderItems = items.map(item => {
                // Check if ID is UUID (real product) or string (mock)
                const isRealProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)

                return {
                    order_id: order.id,
                    product_id: isRealProduct ? item.id : null,
                    quantity: item.quantity,
                    unit_price: item.price,
                    customizations: {
                        name: item.name, // Save name in case product is deleted or null
                        mock_id: !isRealProduct ? item.id : null
                    }
                }
            })

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw new Error(itemsError.message)

            // Success
            clearCart()
            router.push('/checkout/success')

        } catch (error: any) {
            console.error(error)
            alert("Error al procesar el pedido: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return <div>Tu carrito está vacío.</div>
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

            {/* Formulario */}
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Datos de <span className="text-gradient">Envío</span></h2>
                    {!user && (
                        <Link href="/login" className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase border border-primary/20 hover:bg-primary hover:text-black transition-all">
                            Ya tengo cuenta
                        </Link>
                    )}
                </div>

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
                                <span className="font-bold uppercase tracking-tighter">Tarjeta / Bizum</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cash' 
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,184,0,0.1)]' 
                                    : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:border-white/10'}`}
                            >
                                <Banknote className="w-8 h-8" />
                                <span className="font-bold uppercase tracking-tighter">Efectivo</span>
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-20 text-2xl font-black uppercase tracking-tighter italic shadow-[0_0_30px_rgba(255,184,0,0.3)] hover:shadow-[0_0_50px_rgba(255,184,0,0.5)] transition-all rounded-2xl" 
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-8 h-8" /> : `Procesar Pago ${(cartTotal + 2.50).toFixed(2)}€`}
                    </Button>
                </form>
            </div>
        </div>
    )
}
