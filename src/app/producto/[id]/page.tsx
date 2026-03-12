import { Navbar } from "@/components/store/navbar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ProductView } from "@/components/store/product-view"
import { existsSync } from "fs"
import { join } from "path"

export const revalidate = 0

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getProduct(id: string) {
    if (UUID_REGEX.test(id)) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
        if (!error && data) return data
    }

    const slug = id.toLowerCase()
    const { data, error } = await supabase.from('products').select('*').ilike('name', slug).single()

    if (error || !data) return null
    return data
}

/**
 * Comprueba en el filesystem (server-side) si existe el .webm equivalente
 * y lo inyecta en options.video_url sin necesitar escritura en Supabase.
 */
function enrichWithVideo(product: any): any {
    if (!product?.image_url) return product
    if (product.image_url.toLowerCase().endsWith('.webm')) return product

    // Reemplazar extensión para buscar el .webm
    const webmRelPath = product.image_url.replace(/\.(png|jpg|jpeg|webp)$/i, '.webm')
    const absolutePath = join(process.cwd(), 'public', webmRelPath)

    if (existsSync(absolutePath)) {
        return {
            ...product,
            options: { ...(product.options || {}), video_url: webmRelPath }
        }
    }

    return product
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const rawProduct = await getProduct(resolvedParams.id)

    if (!rawProduct) {
        // Fallback con datos locales para slugs que no coincidan por nombre exacto
        const { products: mockProducts } = await import("@/lib/data")
        const mockProduct = mockProducts.find(p => p.id === resolvedParams.id)
        if (mockProduct) {
            const enriched = enrichWithVideo({ ...mockProduct, image_url: mockProduct.image })
            return (
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <div className="pt-24 pb-20 container mx-auto px-6">
                        <Link href="/menu" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4" /> Volver al menú
                        </Link>
                        <ProductView product={{ ...enriched, is_available: true, category_id: mockProduct.category_id }} />
                    </div>
                </div>
            )
        }
        notFound()
    }

    const product = enrichWithVideo(rawProduct)

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-24 pb-20 container mx-auto px-6">
                <Link href="/menu" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Volver al menú
                </Link>
                <ProductView product={product} />
            </div>
        </div>
    )
}
