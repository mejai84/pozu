import { Instagram, Facebook } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full relative z-10 pt-16 pb-8 text-white mt-12" style={{
            backgroundImage: 'url(/images/texture-slate.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.8)'
        }}>
            {/* Torn paper edge effect at the top */}
            <div className="absolute -top-4 left-0 w-full h-8" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 20\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0 v20 q10,-10 20,-5 t20,5 t20,-10 t20,5 t20,-5 t20,10 t20,-10 t20,8 t20,-8 t20,5 t20,-10 t20,10 t20,-5 t20,8 t20,-8 t20,10 t20,-5 t20,5 t20,-10 t20,5 t20,-5 t20,10 t20,-10 t20,8 t20,-8 t20,5 t20,-10 t20,10 t20,-5 t20,8 t20,-8 t20,10 t20,-5 t20,5 t20,-10 t20,5 t20,-5 t20,10 t20,-10 t20,8 t20,-8 t20,5 t20,-10 t20,10 t20,-5 t20,8 t20,-8 t20,10 t20,-5 t20,5 t20,-10 t20,5 t20,-5 t20,10 t20,-10 t20,8 t20,-8 t20,5 t20,-10 v-20 Z\' fill=\'%231A1A1A\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'repeat-x',
                backgroundSize: '100% 100%'
            }}></div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between text-[#E8E0D5] text-sm font-medium tracking-wide">
                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                        <span>Llama al +34 987 654 321</span>
                        <span className="text-muted-foreground mt-1">hola@pozu.com</span>
                    </div>

                    {/* Socials */}
                    <div className="flex items-center gap-8 mb-4 md:mb-0">
                        <a href="#" className="hover:text-primary transition-transform hover:scale-110">
                            <Facebook className="w-5 h-5" fill="currentColor" />
                        </a>
                        <a href="#" className="hover:text-primary transition-transform hover:scale-110">
                            <Instagram className="w-5 h-5" />
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

