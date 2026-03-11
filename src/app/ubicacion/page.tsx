"use client"

import { Navbar } from "@/components/store/navbar"
import { MapPin, Clock, Phone } from "lucide-react"

export default function UbicacionPage() {
    return (
        <div className="min-h-screen bg-[#111111] flex flex-col font-sans pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-6 max-w-6xl">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-[#E8E0D5] neon-text-glow">
                        Dónde <span className="text-primary">Estamos</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Ven a conocernos. El mejor ambiente de Pola de Laviana y las mejores hamburguesas te están esperando.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1A1A1A] border-2 border-white/20 rounded-3xl p-8 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2">Localización</h3>
                            <p className="text-muted-foreground">C. Río Cares, 2<br />33980 Pola de Laviana<br />Asturias, España</p>
                        </div>

                        <div className="bg-[#1A1A1A] border-2 border-white/20 rounded-3xl p-8 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2">Horarios</h3>
                            <p className="text-muted-foreground">Martes a Domingo:<br />19:30 - 23:30<br /><br />Lunes: Cerrado por descanso</p>
                        </div>

                        <div className="bg-[#1A1A1A] border-2 border-white/20 rounded-3xl p-8 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2">Contacto</h3>
                            <p className="text-muted-foreground">Teléfono: +34 987 654 321<br />Email: hola@pozu.com<br />O escríbenos a WhatsApp</p>
                        </div>
                    </div>

                    {/* Google Map */}
                    <div className="lg:col-span-2 h-[300px] md:h-[450px] lg:h-[600px] w-full rounded-3xl overflow-hidden border-2 border-primary neon-border relative group shadow-[0_0_40px_rgba(255,184,0,0.15)] order-first lg:order-last">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2909.103098523674!2d-5.5645!3d43.2458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd367b660a0a0a0a%3A0x0!2sC.%20R%C3%ADo%20Cares%2C%202%2C%2033980%20Pola%20de%20Laviana%2C%20Asturias!5e0!3m2!1ses!2ses!4v1642150000000!5m2!1ses!2ses"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', mixBlendMode: 'screen' }}
                            allowFullScreen
                            loading="lazy"
                            className="grayscale-[0.8] transition-all duration-700 hover:grayscale-0 hover:mix-blend-normal opacity-80 hover:opacity-100"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    )
}
