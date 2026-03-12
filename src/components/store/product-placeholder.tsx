
/**
 * ProductPlaceholder
 * Placeholder de marca para productos sin imagen,
 * con logo POZU y texto "Foto próximamente".
 */
export function ProductPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const isSmall = size === 'sm'
    const isLarge = size === 'lg'

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none pointer-events-none"
            style={{
                background: 'radial-gradient(ellipse at center, #1e1a14 0%, #111111 100%)'
            }}
        >
            {/* Logo ring */}
            <div className={`relative flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm
                ${isSmall ? 'w-10 h-10' : isLarge ? 'w-24 h-24' : 'w-16 h-16'}`}
            >
                {/* Pulse ring */}
                <div className={`absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-30`} />
                {/* POZU Logo text */}
                <span className={`font-black text-primary tracking-tighter leading-none
                    ${isSmall ? 'text-[8px]' : isLarge ? 'text-lg' : 'text-xs'}`}
                >
                    POZU
                </span>
            </div>

            {/* Label */}
            {!isSmall && (
                <div className="text-center space-y-0.5">
                    <p className={`font-bold text-white/60 uppercase tracking-widest
                        ${isLarge ? 'text-sm' : 'text-[10px]'}`}
                    >
                        Foto próximamente
                    </p>
                    {isLarge && (
                        <p className="text-[10px] text-white/30 font-medium">
                            Imagen en preparación
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
