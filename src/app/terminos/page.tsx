import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-3xl">
                <Link href="/checkout" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all mb-12 font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Checkout
                </Link>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Condiciones de <span className="text-primary">Servicio</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">POZU 2.0 - Asturias</p>
                    </div>
                </div>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">1. Aceptación de términos</h2>
                        <p>Al realizar un pedido en Pozu 2.0, el usuario acepta de manera íntegra las presentes condiciones de servicio. Estas condiciones regulan la relación comercial entre el cliente y Pozu Hamburguesas.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">2. Pedidos y Precios</h2>
                        <p>Todos los precios mostrados incluyen IVA. Pozu se reserva el derecho de modificar los precios sin previo aviso, aunque siempre se respetará el precio vigente en el momento de la confirmación del pedido.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">3. Servicio de Entrega (Delivery)</h2>
                        <p>El servicio de entrega tiene un coste fijo de 2.50€. Los tiempos de entrega son estimados y pueden variar según la carga de trabajo de cocina o condiciones meteorológicas en Pola de Laviana y alrededores.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">4. Política de Cancelación</h2>
                        <p>Debido a la naturaleza perecedera de nuestros productos, solo se aceptarán cancelaciones si el pedido aún no ha comenzado a prepararse en cocina. Una vez el pedido esté en estado "En preparación", no se admitirán devoluciones.</p>
                    </section>

                    <p className="pt-10 text-[10px] uppercase font-bold tracking-[0.2em] border-t border-white/5">Última actualización: 15 de marzo de 2026</p>
                </div>
            </div>
        </main>
    )
}
