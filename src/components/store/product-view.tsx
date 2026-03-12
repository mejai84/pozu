
"use client"

import { useState } from "react"
import Image from "next/image"
import { 
    X, Info, Maximize2, Wheat, Milk, Egg, Fish, 
    Leaf, Flame, Droplets, Nut, ChefHat, Beef, 
    CircleAlert, Cookie, Soup
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AddToCartButton } from "@/components/store/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/store/product-image"


export function ProductView({ product }: { product: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Mapeo de iconos para alérgenos comunes
    const getAllergenIcon = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('gluten') || n.includes('trigo')) return <Wheat className="w-3 h-3" />
        if (n.includes('lácteo') || n.includes('leche')) return <Milk className="w-3 h-3" />
        if (n.includes('huevo')) return <Egg className="w-3 h-3" />
        if (n.includes('pescado')) return <Fish className="w-3 h-3" />
        if (n.includes('fruto') || n.includes('nuez') || n.includes('cacahuete')) return <Nut className="w-3 h-3" />
        if (n.includes('soja')) return <Soup className="w-3 h-3" />
        if (n.includes('mostaza')) return <Droplets className="w-3 h-3" />
        return <CircleAlert className="w-3 h-3" />
    }

    // Mapeo de iconos para ingredientes comunes
    const getIngredientIcon = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('carne') || n.includes('vacuno') || n.includes('ternera') || n.includes('burguer')) return <Beef className="w-3 h-3" />
        if (n.includes('lechuga') || n.includes('tomate') || n.includes('cebolla') || n.includes('pepinillo') || n.includes('vegetal')) return <Leaf className="w-3 h-3" />
        if (n.includes('queso') || n.includes('cheddar') || n.includes('brie')) return <Milk className="w-3 h-3" />
        if (n.includes('bacon') || n.includes('tocino') || n.includes('panceta')) return <Flame className="w-3 h-3" />
        if (n.includes('salsa') || n.includes('mayo') || n.includes('ketchup')) return <Droplets className="w-3 h-3" />
        if (n.includes('pan') || n.includes('brioche')) return <Cookie className="w-3 h-3" />
        return <ChefHat className="w-3 h-3" />
    }

    // Datos mock adicionales para simular la vista tipo McDonalds
    const nutritionalInfo = {
        calories: "540 kcal",
        protein: "32g",
        fat: "28g",
        carbs: "45g"
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Imagen Principal / Video */}
            <div className="relative aspect-square w-full max-w-[600px] mx-auto bg-card/30 rounded-3xl p-8 border border-white/5 flex items-center justify-center group overflow-hidden">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75 group-hover:scale-90 transition-transform duration-700" />

                <div className="relative w-full h-full animate-in zoom-in duration-500">
                    {/* Plantilla Universal de Medios con Soporte para Video DB */}
                    {(() => {
                        const videoSrc = product.options?.video_url || (product.image_url?.toLowerCase().endsWith('.webm') ? product.image_url : null);
                        const isVideo = !!videoSrc;
                        const mainSrc = isVideo ? videoSrc : (product.image_url || product.image || null);
                        const hasImage = !!mainSrc

                        const thumbSrc = product.options?.video_url 
                            ? (product.image_url || null)
                            : (isVideo && typeof mainSrc === 'string'
                                ? mainSrc.replace(/\.webm$/i, '.png').toLowerCase() 
                                : mainSrc);
                        const hasThumb = !!thumbSrc

                        return (
                            <div className="relative w-full h-full">
                                {isVideo ? (
                                    <video
                                        src={mainSrc!}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                                    />
                                ) : (
                                    <ProductImage
                                        src={mainSrc}
                                        alt={product.name}
                                        fill
                                        className="object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                                        priority
                                        placeholderSize="lg"
                                    />
                                )}
                                
                                {/* Miniatura en esquina: solo si hay imagen estática disponible y es distinta al medio principal o es video */}
                                {hasThumb && (
                                    <motion.div 
                                        onClick={() => setIsModalOpen(true)}
                                        className="absolute bottom-2 right-2 w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-primary/30 bg-black/40 backdrop-blur-md overflow-hidden shadow-xl cursor-pointer group/corner hover:border-primary transition-all animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ProductImage
                                            src={thumbSrc}
                                            alt={`${product.name} miniatura`}
                                            fill
                                            className="object-contain p-2 group-hover/corner:scale-110 transition-transform"
                                            placeholderSize="sm"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/corner:opacity-100 flex items-center justify-center transition-opacity">
                                            <Maximize2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-white/10 opacity-0 group-hover/corner:opacity-100 transition-opacity">
                                            <div className="text-[8px] font-bold text-white uppercase tracking-tighter">Zoom</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Detalles del Producto */}
            <div className="space-y-8">
                <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{product.name}</h1>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{product.price.toFixed(2)}€</div>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {product.description || "Deliciosa combinación de ingredientes frescos y carne de primera calidad."}
                    </p>
                </div>

                {/* Ingredientes REALES de la DB */}
                {product.ingredients && product.ingredients.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            Ingredientes principales
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {product.ingredients.map((ing: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-colors">
                                    {getIngredientIcon(ing)}
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Alérgenos REALES de la DB */}
                {product.allergens && product.allergens.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-red-400">
                            <CircleAlert className="w-4 h-4" />
                            Información sobre Alérgenos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {product.allergens.map((all: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-400 font-medium uppercase tracking-wider hover:bg-red-500/20 transition-colors">
                                    {getAllergenIcon(all)}
                                    {all}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Nutricional Mock */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Calorías</div>
                        <div className="font-bold text-sm sm:text-base">{nutritionalInfo.calories}</div>
                    </div>
                    <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Proteína</div>
                        <div className="font-bold text-sm sm:text-base">{nutritionalInfo.protein}</div>
                    </div>
                    <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Grasas</div>
                        <div className="font-bold text-sm sm:text-base">{nutritionalInfo.fat}</div>
                    </div>
                    <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Carb.</div>
                        <div className="font-bold text-sm sm:text-base">{nutritionalInfo.carbs}</div>
                    </div>
                </div>

                {/* Add to Cart */}
                <div className="pt-6 border-t border-white/10">
                    <AddToCartButton product={product} />
                </div>
            </div>

            {/* Modal para ver imagen grande */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl aspect-square"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors flex items-center gap-2 font-bold"
                            >
                                <X className="w-6 h-6" /> Cerrar
                            </button>
                            
                            <div className="relative w-full h-full bg-card/20 rounded-3xl overflow-hidden border border-white/10">
                                <Image
                                    src={product.options?.video_url 
                                        ? (product.image_url || "/images/burgers/pozu.png")
                                        : (product.image_url?.toLowerCase().endsWith('.webm')
                                            ? product.image_url.replace(/\.webm$/i, '.png').toLowerCase()
                                            : (product.image_url || product.image || "/images/burgers/pozu.png"))
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-contain p-8"
                                    onClick={() => setIsModalOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
