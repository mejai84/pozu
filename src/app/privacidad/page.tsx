import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-3xl">
                <Link href="/checkout" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all mb-12 font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Checkout
                </Link>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Política de <span className="text-primary">Privacidad</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">POZU 2.0 - Protección de Datos</p>
                    </div>
                </div>

                <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">1. Responsable del Tratamiento</h2>
                        <p>Pozu Hamburguesas (en adelante "POZU 2.0"), con domicilio en Pola de Laviana, Asturias, es el responsable del tratamiento de sus datos personales recogidos a través de esta plataforma web.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">2. Datos que Recogemos</h2>
                        <p>Para procesar sus pedidos, recogemos los siguientes datos: Nombre, apellidos, dirección de entrega, número de teléfono y correo electrónico. Si utiliza pagos con tarjeta, los datos bancarios son gestionados de forma segura y directa por Stripe, POZU 2.0 nunca almacena los datos de su tarjeta.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">3. Finalidad del Tratamiento</h2>
                        <p>Sus datos se utilizan exclusivamente para:
                            <ul className="list-disc ml-6 mt-2 space-y-1">
                                <li>Gestionar y entregar su pedido.</li>
                                <li>Contactar con usted en caso de incidencias con la entrega.</li>
                                <li>Cumplir con nuestras obligaciones legales y contables.</li>
                            </ul>
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">4. Conservación de Datos</h2>
                        <p>Conservaremos sus datos personales únicamente durante el tiempo necesario para la finalidad para la que fueron recogidos o durante el tiempo exigido por la ley.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">5. Sus Derechos (GDPR)</h2>
                        <p>Usted tiene derecho a acceder, rectificar o suprimir sus datos, así como otros derechos reconocidos en la normativa vigente, enviando un correo electrónico a hola@pozu.com.</p>
                    </section>

                    <p className="pt-10 text-[10px] uppercase font-bold tracking-[0.2em] border-t border-white/5">Última actualización: 15 de marzo de 2026</p>
                </div>
            </div>
        </main>
    )
}
