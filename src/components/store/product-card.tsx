
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/store/cart-context"
import type { Product } from "@/lib/data"
import { ProductImage } from "@/components/store/product-image"

export function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart()

    // Lógica para determinar el src de la imagen (estática o video convertido a png)
    const imageSrc = product.image?.toLowerCase().endsWith('.webm')
        ? product.image.replace(/\.webm$/i, '.png').toLowerCase()
        : product.image

    return (
        <div className="group relative bg-card border border-white/5 rounded-3xl p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
            <Link href={`/producto/${product.id}`} className="block relative aspect-square mb-6 overflow-hidden rounded-2xl bg-white/5 cursor-pointer">
                <ProductImage
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    placeholderSize="md"
                />
                {(product.badge || (product.options as any)?.badge) && (
                    <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        {product.badge || (product.options as any)?.badge}
                    </span>
                )}
            </Link>

            <div className="flex flex-col gap-3 px-2 flex-1">
                <Link href={`/producto/${product.id}`} className="block flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        <span className="font-bold text-lg">{product.price.toFixed(2)}€</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {product.ingredients?.join(", ") || product.description}
                    </p>

                    {(product.options as any)?.observation && (
                        <div className="mt-3 py-1.5 px-3 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-[10px] uppercase font-bold text-primary tracking-wider leading-tight">
                                ✨ {(product.options as any).observation}
                            </p>
                        </div>
                    )}

                    {(product.options as any)?.sauce_note && (
                        <p className="text-[10px] italic text-muted-foreground mt-2">
                            * {(product.options as any).sauce_note}
                        </p>
                    )}

                    {product.allergens && (
                        <div className="flex gap-1.5 mt-3">
                            {(Array.isArray(product.allergens) ? product.allergens : product.allergens.split(',').map((s: string) => s.trim()).filter(Boolean)).map((allergen: string) => (
                                <span 
                                    key={allergen} 
                                    title={allergen}
                                    className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground border border-white/5 hover:border-primary/50 transition-colors cursor-help"
                                >
                                    {allergen[0]}
                                </span>
                            ))}
                        </div>
                    )}
                </Link>

                {/* Botón de acción inteligente */}
                {(product.category_id === "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e" || product.name.toLowerCase().includes("hamburguesa") || product.name.toLowerCase().includes("pozu") || product.name.toLowerCase().includes("cesta")) ? (
                    <Link href={`/producto/${product.id}`} className="w-full mt-4">
                        <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-black border border-primary/20 font-black uppercase italic tracking-tighter">
                            Personalizar
                        </Button>
                    </Link>
                ) : (
                    <Button
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-all bg-card border border-white/10 hover:border-primary z-20 relative font-black uppercase italic tracking-tighter text-xs"
                        onClick={(e) => {
                            e.preventDefault(); 
                            addItem(product);
                        }}
                    >
                        Añadir al carrito
                    </Button>
                )}
            </div>
        </div>
    )
}
