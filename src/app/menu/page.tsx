"use client"

import { Navbar } from "@/components/store/navbar"
import { ProductCard } from "@/components/store/product-card"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState, Suspense } from "react"
import { Search, Loader2, Sparkles, Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

function MenuContent() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all")

    useEffect(() => {
        const cat = searchParams.get("category")
        if (cat) setActiveCategory(cat)
    }, [searchParams])

    const fetchData = async () => {
        setLoading(true)

        // Fetch Categories
        const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('order_position')

        if (catData) setCategories(catData)

        // Fetch Products
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_available', true)
            .order('is_featured', { ascending: false })
            .order('name')

        if (!error && data) {
            setProducts(data)
        } else {
            // Fallback to local data
            const { products: localProducts } = await import("@/lib/data")
            setProducts(localProducts)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = activeCategory === "all" || product.category_id === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales Globales */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />

            <div className="pt-28 sm:pt-40 container mx-auto px-4 sm:px-6 relative">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
                >
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-bounce-slow">
                            <Sparkles className="w-4 h-4" />
                            Catálogo Completo Pozu 2.0
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                            Nuestra <span className="text-gradient">Carta</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Desde las clásicas del Pozu hasta nuestras creaciones más atrevidas. 
                            Experimenta el sabor de la verdadera ternera asturiana.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-focus-within:bg-primary/20 transition-all opacity-0 group-focus-within:opacity-100" />
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Busca tu hamburguesa..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all text-lg backdrop-blur-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Categories Strategy */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col space-y-4 mb-12"
                >
                    <div className="flex items-center gap-2 text-primary font-bold px-1">
                        <Filter className="w-4 h-4" />
                        <span>Filtrar por categoría</span>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-6 px-6">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold transition-all border-2 text-sm uppercase tracking-wider ${activeCategory === "all"
                                ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,184,0,0.3)] scale-105"
                                : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10 hover:border-white/10"
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold transition-all border-2 text-sm uppercase tracking-wider ${activeCategory === cat.id
                                    ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,184,0,0.3)] scale-105"
                                    : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10 hover:border-white/10"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Products Grid Control */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-primary" />
                            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                        </div>
                        <p className="text-xl text-muted-foreground animate-pulse font-medium">Preparando la parrilla...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredProducts.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm"
                            >
                                <div className="text-8xl animate-bounce">🍔</div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold">No encontramos esa joya</h3>
                                    <p className="text-muted-foreground text-lg">Prueba buscando otro nombre o cambia de sección.</p>
                                </div>
                                <button
                                    onClick={() => { setSearchTerm(""); setActiveCategory("all"); }}
                                    className="px-8 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold hover:bg-primary hover:text-black transition-all"
                                >
                                    Ver toda la carta
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {filteredProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        layout
                                    >
                                        <ProductCard
                                            product={{
                                                ...product,
                                                image: product.image_url || product.image
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <MenuContent />
        </Suspense>
    )
}
