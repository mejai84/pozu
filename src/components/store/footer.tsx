import { Instagram, Facebook, Youtube, Music2 } from "lucide-react"

export function Footer() {
    return (
        <footer className="footer-dark w-full relative z-10 pt-16 pb-12 text-white mt-20 border-t border-white/5 bg-gradient-to-b from-[#111] to-black shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between text-[#E8E0D5] text-sm font-medium tracking-wide">
                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                        <span>Llama al +34 987 654 321</span>
                        <span className="text-muted-foreground mt-1">hola@pozu.com</span>
                    </div>

                    {/* Socials */}
                    <div className="flex items-center gap-8 mb-4 md:mb-0">
                        <a href="https://www.facebook.com/pozu2.0" target="_blank" rel="noreferrer" className="hover:text-primary transition-all hover:scale-110 group">
                            <Facebook className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" fill="currentColor" />
                        </a>
                        <a href="https://www.instagram.com/el_pozu_2.0/?hl=es" target="_blank" rel="noreferrer" className="hover:text-primary transition-all hover:scale-110 group">
                            <Instagram className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        </a>
                        <a href="#" target="_blank" rel="noreferrer" className="hover:text-primary transition-all hover:scale-110 group">
                            <Youtube className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        </a>
                        <a href="https://www.tiktok.com/@el_pozu_2.0" target="_blank" rel="noreferrer" className="hover:text-primary transition-all hover:scale-110 group">
                            <Music2 className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        </a>
                    </div>

                    {/* Hours */}
                    <div className="flex flex-col items-center md:items-end">
                        <span>Abierto</span>
                        <span className="text-muted-foreground mt-1">Mar-Dom: 19:30 - 23:30</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

