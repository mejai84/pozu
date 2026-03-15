import { Instagram, Facebook, Youtube, Music2, MapPin, Phone, Mail, Clock, ShieldCheck, ExternalLink } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full relative z-10 pt-24 pb-12 text-white mt-20 border-t border-white/5 bg-black overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2" />
            
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">POZU <span className="text-primary">2.0</span></h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-2">La mejor burger de Asturias</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Cocinamos con pasión y productos de nuestra tierra para ofrecerte una experiencia Rock & Burger inigualable.
                        </p>
                        <div className="flex items-center gap-4">
                             <a href="https://www.instagram.com/el_pozu_2.0/" target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all group">
                                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all group">
                                <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all group">
                                <Music2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/5 pb-4">Explora</h4>
                        <ul className="space-y-3">
                            {['Inicio', 'Menú', 'Combos', 'Ubicación', 'Reservar'].map((item) => (
                                <li key={item}>
                                    <Link href={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Hours */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/5 pb-4">Contacto</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-white">C. Río Cares, 2</p>
                                    <p className="text-muted-foreground">Pola de Laviana, Asturias</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-sm font-bold text-white">+34 987 654 321</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-white">Mar-Dom: 19:30 - 23:30</p>
                                    <p className="text-muted-foreground">Cerrado los Lunes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Legal Overlay */}
                    <div className="space-y-6">
                         <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/5 pb-4">Legal & Seguro</h4>
                         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-green-500/80">
                                <ShieldCheck className="w-4 h-4" />
                                PAGO 100% SEGURO
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link href="/terminos" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-between group">
                                    Términos de Servicio
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <Link href="/privacidad" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-between group">
                                    Política de Privacidad
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                        © 2026 POZU 2.0. Reservados todos los derechos.
                    </p>
                    <div className="flex items-center gap-8">
                         <Link href="/admin" className="text-[10px] text-white/20 hover:text-primary transition-colors flex items-center gap-2 group/admin px-3 py-1 rounded-full border border-white/5 hover:border-primary/20">
                             ADMIN PANEL
                         </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
