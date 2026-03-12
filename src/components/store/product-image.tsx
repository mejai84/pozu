
"use client"

import { useState } from "react"
import Image from "next/image"
import { ProductPlaceholder } from "./product-placeholder"

interface ProductImageProps {
    src?: string | null
    alt: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    priority?: boolean
    placeholderSize?: 'sm' | 'md' | 'lg'
}

/**
 * ProductImage
 * Componente de imagen de producto con fallback inteligente.
 * Si la imagen falta, es nula o falla al cargar, muestra el ProductPlaceholder premium.
 */
export function ProductImage({ 
    src, 
    alt, 
    fill, 
    width, 
    height, 
    className, 
    priority,
    placeholderSize = 'md'
}: ProductImageProps) {
    const [hasError, setHasError] = useState(false)

    // Considerar como "sin imagen" si:
    // 1. src es null/undefined/vacío
    // 2. src contiene la palabra "placeholder"
    // 3. Ya ha dado error al cargar
    const isMissing = !src || src.toLowerCase().includes('placeholder') || hasError

    if (isMissing) {
        return (
            <div className={className}>
                <ProductPlaceholder size={placeholderSize} />
            </div>
        )
    }

    return (
        <Image
            src={src!}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            className={className}
            priority={priority}
            onError={() => setHasError(true)}
            sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        />
    )
}
