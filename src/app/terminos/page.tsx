import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale } from "lucide-react";

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
                        <Scale className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Condiciones de <span className="text-primary">Servicio</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">POZU 2.0 - Aviso Legal y Contrato</p>
                    </div>
                </div>

                <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">1. Aceptación de los Términos</h2>
                        <p>Al acceder y utilizar este sitio web para realizar pedidos, usted acuerda estar legalmente vinculado por estas Condiciones de Servicio. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">2. Disponibilidad y Alérgenos</h2>
                        <p>La disponibilidad de los productos está sujeta al stock diario. Pozu 2.0 se esfuerza por informar sobre alérgenos, pero debido a la naturaleza de nuestra cocina artesanal, existe el riesgo de contaminación cruzada. Si tiene una alergia grave, por favor contacte directamente con el local antes de realizar el pedido.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">3. Precios y Pagos</h2>
                        <p>Los precios incluyen el Impuesto sobre el Valor Añadido (IVA) conforme a la legislación española. Los pagos se procesan de forma segura a través de Stripe (para tarjetas) o se abonan en efectivo al repartidor. Pozu se reserva el derecho de cancelar pedidos que presenten indicios de fraude o datos de contacto falsos.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">4. Entrega y Derecho de Desistimiento</h2>
                        <p>Realizamos entregas en Pola de Laviana y zonas limítrofes. El tiempo de entrega es una estimación. Conforme al Artículo 103 del Real Decreto Legislativo 1/2007 (Ley de Consumidores), el **derecho de desistimiento no es aplicable** a productos alimenticios que, por su naturaleza, puedan deteriorarse o caducar con rapidez una vez preparados.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">5. Legislación Aplicable</h2>
                        <p>Estas condiciones se rigen por las leyes de España. Cualquier disputa relacionada con estos términos será competencia exclusiva de los tribunales de Asturias, España.</p>
                    </section>

                    <p className="pt-10 text-[10px] uppercase font-bold tracking-[0.2em] border-t border-white/5">Última actualización: 15 de marzo de 2026</p>
                </div>
            </div>
        </main>
    )
}
