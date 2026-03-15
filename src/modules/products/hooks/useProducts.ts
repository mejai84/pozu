import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Product, FormData as ProductFormData } from '../types'

export const useProducts = (searchQuery: string, categoryFilter: string, showDeleted: boolean) => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    const fetchProducts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) console.error('Error fetching products:', error)
        else setProducts(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchProducts() }, [])

    const displayedProducts = useMemo(() => {
        return products
            .filter(p => showDeleted ? p.deleted_at : !p.deleted_at)
            .filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     p.description?.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter
                return matchesSearch && matchesCategory
            })
    }, [products, showDeleted, searchQuery, categoryFilter])

    const stats = useMemo(() => ({
        total: products.filter(p => !p.deleted_at).length,
        outOfStock: products.filter(p => !p.deleted_at && ((p.stock_quantity ?? 0) <= 0 || !p.is_available)).length,
        featured: products.filter(p => !p.deleted_at && p.options?.badge).length
    }), [products])

    const toggleAvailability = async (product: Product) => {
        const { error } = await supabase
            .from('products')
            .update({ is_available: !product.is_available })
            .eq('id', product.id)
        if (error) alert("Error al cambiar disponibilidad")
        else fetchProducts()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Mover este producto a la papelera?")) return
        const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', id)
        if (error) alert("Error al eliminar: " + error.message)
        fetchProducts()
    }

    const handleRestore = async (id: string) => {
        const { error } = await supabase.from('products').update({ deleted_at: null }).eq('id', id)
        if (error) alert("Error al restaurar")
        else fetchProducts()
    }

    const handleSave = async (editingId: string | null, formData: ProductFormData) => {
        if (!formData.name || !formData.price) return { error: "Nombre y Precio son obligatorios" }
        
        const productData = {
            name: formData.name,
            price: parseFloat(formData.price!.toString()),
            category_id: formData.category_id,
            description: formData.description,
            image_url: formData.image_url,
            is_available: (formData.stock_quantity ?? 0) > 0 ? (formData.is_available ?? true) : false,
            ingredients: Array.isArray(formData.ingredients) ? formData.ingredients : [],
            allergens: formData.allergens,
            stock_quantity: formData.stock_quantity,
            options: { 
                video_url: formData.video_url || null,
                badge: formData.badge || null
            }
        }

        let error;
        if (editingId) {
            const res = await supabase.from('products').update(productData).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('products').insert([productData])
            error = res.error
        }

        if (!error) await fetchProducts()
        return { error }
    }

    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        setUploading(true)
        try {
            const uploadFormData = new window.FormData()
            uploadFormData.append('file', file)
            uploadFormData.append('type', type)
            const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Upload failed')
            return { url: result.url as string }
        } catch (err: any) {
            alert(`Error al subir el ${type}: ${err.message}`)
            return { error: err.message }
        } finally {
            setUploading(false)
        }
    }

    return {
        products,
        displayedProducts,
        loading,
        uploading,
        stats,
        toggleAvailability,
        handleDelete,
        handleRestore,
        handleSave,
        handleFileUpload,
        refresh: fetchProducts
    }
}
