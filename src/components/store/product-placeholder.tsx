import Image from "next/image"

/**
 * ProductPlaceholder
 * Placeholder de marca premium para productos sin imagen,
 * utilizando el logo oficial de POZU 2.0.
 */
export function ProductPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const isSmall = size === 'sm'
    const isLarge = size === 'lg'

    return (
        <div className="w-full h-full relative flex flex-col items-center justify-center gap-4 select-none pointer-events-none overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)'
            }}
        >
            {/* Efecto de luz de fondo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(232,224,213,0.05)_0%,_transparent_70%)]" />

            {/* Logo y Anillo */}
            <div className={`relative flex items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm
                ${isSmall ? 'w-12 h-12' : isLarge ? 'w-32 h-32' : 'w-24 h-24'}`}
            >
                {/* Anillo de pulso animado */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-slow" />
                
                <div className={`relative ${isSmall ? 'w-10 h-10' : isLarge ? 'w-28 h-28' : 'w-20 h-20'} drop-shadow-[0_0_15px_rgba(255,184,0,0.3)]`}>
                    <Image
                        src="/images/logo_2_0.png"
                        alt="Pozu 2.0 Logo"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Texto de Marca y Estado */}
            {!isSmall && (
                <div className="text-center z-10 space-y-1">
                    <h3 className={`font-black uppercase tracking-[0.2em] text-[#E8E0D5]
                        ${isLarge ? 'text-xl' : 'text-xs'}`}>
                        POZU 2.0
                    </h3>
                    <div className="flex flex-col items-center gap-1">
                        <p className={`font-bold text-primary/80 uppercase tracking-widest
                            ${isLarge ? 'text-sm' : 'text-[10px]'}`}>
                            Foto próximamente
                        </p>
                        {isLarge && (
                            <p className="text-[10px] text-white/30 font-medium max-w-[150px] leading-tight">
                                Estamos preparando la presentación gourmet de este producto.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
