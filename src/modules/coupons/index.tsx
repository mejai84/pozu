"use client"

import { useState } from 'react'
import { Plus, Ticket, Trash2, ToggleLeft, ToggleRight, Search, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCoupons } from './hooks/useCoupons'

export const CouponsModule = () => {
    const { coupons, loading, toggleCoupon, deleteCoupon, createCoupon } = useCoupons()
    const [searchTerm, setSearchTerm] = useState("")

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        Gestión de <span className="text-primary">Cupones</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Marketing y fidelización de clientes</p>
                </div>
                <Button className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tighter gap-3 bg-primary text-black hover:bg-primary/80">
                    <Plus className="w-5 h-5" /> Crear Cupón
                </Button>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/40 font-bold transition-all"
                    placeholder="Buscar código de cupón..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                        <Ticket className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                        <div className="space-y-1">
                            <p className="font-bold text-muted-foreground">No hay cupones activos</p>
                            <p className="text-xs text-muted-foreground/60">Crea tu primer cupón para incentivar las ventas</p>
                        </div>
                    </div>
                ) : (
                    filteredCoupons.map((coupon) => (
                        <div key={coupon.id} className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-primary/40 transition-all">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Ticket className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{coupon.code}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `${coupon.discount_value}€ OFF`}
                                        </span>
                                        {coupon.usage_limit && (
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                {coupon.usage_count} / {coupon.usage_limit} Usos
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right hidden xl:block">
                                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest justify-end">
                                        <Clock className="w-3 h-3" /> Expiración
                                    </div>
                                    <p className="text-sm font-bold">{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Ilimitado'}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                                        className={`p-2 transition-colors ${coupon.active ? 'text-green-500' : 'text-muted-foreground'}`}
                                    >
                                        {coupon.active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                    </button>
                                    <button 
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-40 hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="p-6 bg-black/40 rounded-3xl">
                    < ShieldCheck className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">Motor de Promociones Activo</h4>
                    <p className="text-sm text-muted-foreground max-w-lg">Los cupones se aplican automáticamente en el carrito si el código coincide y se cumplen las condiciones de compra mínima.</p>
                </div>
            </div>
        </div>
    )
}
