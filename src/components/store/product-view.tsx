"use client"

import { useState } from "react"
import Image from "next/image"
import { 
    X, Info, Maximize2, Wheat, Milk, Egg, Fish, 
    Leaf, Flame, Droplets, Nut, ChefHat, Beef, 
    CircleAlert, Cookie, Soup, ArrowRight, Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AddToCartButton } from "@/components/store/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/store/product-image"
import { cn } from "@/lib/utils"


export function ProductView({ product }: { product: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [observations, setObservations] = useState("")
    const [meatType, setMeatType] = useState<"Vacuno" | "Pollo">("Vacuno")
    const [selectedSauce, setSelectedSauce] = useState<string>("Pozu Special")

    const isBurger = product.category_id === "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e" || product.name.toLowerCase().includes("hamburguesa") || product.name.toLowerCase().includes("pozu") || product.name.toLowerCase().includes("gourmet")
    const isCesta = product.name.toLowerCase().includes("cesta")
    const needsSauce = isCesta || product.name.toLowerCase().includes("crujiente") || product.name.toLowerCase().includes("kentucky") || product.name.toLowerCase().includes("dedos")

    const sauceOptions = ["Pozu Special", "Alioli Casero", "Brava Picante", "Miel y Mostaza", "Ketchup", "Mayonesa", "Barbacoa"]

    // Mapeo de iconos para alérgenos comunes
    const getAllergenIcon = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('gluten') || n.includes('trigo') || n.includes('pan')) return <Wheat className="w-3 h-3" />
        if (n.includes('lácteo') || n.includes('leche') || n.includes('queso')) return <Milk className="w-3 h-3" />
        if (n.includes('huevo')) return <Egg className="w-3 h-3" />
        if (n.includes('pescado')) return <Fish className="w-3 h-3" />
        if (n.includes('fruto') || n.includes('nuez') || n.includes('cacahuete')) return <Nut className="w-3 h-3" />
        if (n.includes('soja')) return <Soup className="w-3 h-3" />
        if (n.includes('mostaza')) return <Droplets className="w-3 h-3" />
        if (n.includes('sésamo')) return <Cookie className="w-3 h-3" />
        if (n.includes('crustáceo')) return <CircleAlert className="w-3 h-3" />
        return <CircleAlert className="w-3 h-3" />
    }

    // Lógica para inferir alérgenos si no existen en la DB
    const getInferredAllergens = (ingredients: string[] = []) => {
        const inferred = new Set<string>()
        ingredients.forEach(ing => {
            const n = ing.toLowerCase()
            if (n.includes('pan') || n.includes('brioche') || n.includes('germen') || n.includes('trigo')) inferred.add('Gluten')
            if (n.includes('queso') || n.includes('cheddar') || n.includes('edam') || n.includes('yogur') || n.includes('leche')) inferred.add('Lácteos')
            if (n.includes('huevo') || n.includes('mayo')) inferred.add('Huevos')
            if (n.includes('mostaza')) inferred.add('Mostaza')
            if (n.includes('soja')) inferred.add('Soja')
            if (n.includes('sésamo')) inferred.add('Sésamo')
            if (n.includes('frutos secos') || n.includes('cacahuete')) inferred.add('Frutos Secos')
        })
        return Array.from(inferred)
    }

    const allergensList = product.allergens && product.allergens.length > 0 
        ? product.allergens 
        : getInferredAllergens(product.ingredients)

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

    const finalPrice = meatType === "Pollo" ? product.price + 2.00 : product.price

    return (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center relative">
            {/* Luces Ambientales de Fondo */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse" />
            
            {/* Luz de acento Derecha (Sutil Glow) */}
            <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10 opacity-60" />
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Imagen Principal / Video */}
            <div className="relative aspect-square w-full max-w-[600px] mx-auto bg-card/30 rounded-3xl p-8 border border-white/5 flex items-center justify-center group overflow-hidden shadow-2xl">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 rounded-full blur-3xl scale-110 group-hover:scale-125 transition-transform duration-700" />

                <div className="relative w-full h-full animate-in zoom-in duration-500">
                    {/* Plantilla Universal de Medios con Soporte para Video DB */}
                    {(() => {
                        const videoSrc = product.options?.video_url || (product.image_url?.toLowerCase().endsWith('.webm') ? product.image_url : null);
                        const isVideo = !!videoSrc;
                        const mainSrc = isVideo ? videoSrc : (product.image_url || product.image || null);
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
                                
                                {/* Miniatura en esquina */}
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
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{finalPrice.toFixed(2)}€</div>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {product.description || "Deliciosa combinación de ingredientes frescos y carne de primera calidad."}
                    </p>
                </div>

                {/* Ingredientes REALES */}
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

                {/* Alérgenos */}
                {allergensList.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <h3 className="font-bold flex items-center gap-2 text-red-400">
                            <CircleAlert className="w-4 h-4" />
                            Información sobre Alérgenos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {allergensList.map((all: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-400 font-medium uppercase tracking-wider hover:bg-red-500/20 transition-colors">
                                    {getAllergenIcon(all)}
                                    {all}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Nutricional */}
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

                {/* Selectores de Personalización */}
                <div className="space-y-6 pt-6 border-t border-white/10">
                    {/* Selección de Salsa (Cesta) */}
                    {needsSauce && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-white">
                                <Droplets className="w-5 h-5 text-primary" />
                                2. Elige tu salsa
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {sauceOptions.map((sauce) => (
                                    <button
                                        key={sauce}
                                        onClick={() => setSelectedSauce(sauce)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                            selectedSauce === sauce 
                                                ? "bg-primary/10 border-primary text-primary" 
                                                : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        <Droplets className="w-5 h-5" />
                                        <span className="font-bold uppercase tracking-tighter text-[10px]">{sauce}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selección de Carne (Hamburguesas) */}
                    {isBurger && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-white">
                                <Beef className="w-5 h-5 text-primary" />
                                1. Selecciona tu proteína
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMeatType("Vacuno")}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                        meatType === "Vacuno" 
                                            ? "bg-primary/10 border-primary text-primary" 
                                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    <Beef className="w-6 h-6" />
                                    <span className="font-bold uppercase tracking-tighter text-sm">Ternera Asturiana</span>
                                </button>
                                <button
                                    onClick={() => setMeatType("Pollo")}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative",
                                        meatType === "Pollo" 
                                            ? "bg-primary/10 border-primary text-primary" 
                                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    <motion.span 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg"
                                    >
                                        +2€
                                    </motion.span>
                                    <ChefHat className="w-6 h-6" />
                                    <span className="font-bold uppercase tracking-tighter text-sm">Pollo Crujiente</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Observaciones */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-white">
                            <ChefHat className="w-5 h-5 text-primary" />
                            3. ¿Alguna nota especial?
                        </h3>
                        <div className="relative group">
                            <textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Ej: Sin cebolla, poco hecha, sin tomate..."
                                className="w-full h-28 bg-white/5 border border-white/20 rounded-2xl p-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40 font-medium text-white"
                            />
                            <div className="absolute bottom-3 right-3 text-[9px] font-black uppercase tracking-[0.3em] text-primary/30 pointer-events-none group-focus-within:text-primary transition-colors">
                                Personalización
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón Añadir al Carrito */}
                <div className="pt-6 border-t border-white/10">
                    <AddToCartButton 
                        product={product} 
                        price={finalPrice}
                        options={
                            [
                                isBurger ? `CARNE: ${meatType}` : null,
                                needsSauce ? `SALSA: ${selectedSauce}` : null,
                                observations ? `NOTAS: ${observations}` : null
                            ].filter(Boolean).join(" | ")
                        } 
                    />
                </div>
            </div>

            {/* Modal de Imagen */}
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
                                    src={product.image_url || "/images/burgers/pozu.png"}
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
