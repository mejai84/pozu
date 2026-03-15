"use client"

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Layers } from 'lucide-react'
import { categories } from '@/lib/data'

import { useProducts } from './hooks/useProducts'
import { useMediaLibrary } from './hooks/useMediaLibrary'
import { ProductsHeader } from './components/ProductsHeader'
import { ProductsActions } from './components/ProductsActions'
import { ProductCard } from './components/ProductCard'
import { ProductsTable } from './components/ProductsTable'
import { ProductFormModal } from './components/ProductFormModal'
import { Product, ViewMode, FormData as ProductFormData } from './types'

export const ProductsModule = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [showDeleted, setShowDeleted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        price: 0,
        category_id: 'cat_burgers',
        description: '',
        image_url: '',
        video_url: '',
        badge: '',
        ingredients: [],
        allergens: '',
        stock_quantity: 0
    })

    const { 
        displayedProducts, loading, stats, uploading,
        toggleAvailability, handleDelete, handleRestore, handleSave, handleFileUpload 
    } = useProducts(searchQuery, categoryFilter, showDeleted)

    const { mediaLibrary, loadingMedia, fetchMediaLibrary } = useMediaLibrary()

    const handleEdit = (product: Product) => {
        setEditingId(product.id)
        setFormData({
            name: product.name,
            price: product.price,
            category_id: product.category_id,
            description: product.description,
            image_url: product.image_url,
            is_available: product.is_available,
            video_url: product.options?.video_url || '',
            badge: product.options?.badge || '',
            ingredients: product.ingredients || [],
            allergens: product.allergens || '',
            stock_quantity: product.stock_quantity || 0
        })
        setIsEditing(true)
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ name: '', price: 0, category_id: 'cat_burgers', description: '', image_url: '', video_url: '', badge: '', ingredients: [], allergens: '', stock_quantity: 0 })
        setIsEditing(false)
    }

    const onSave = async () => {
        const { error } = await handleSave(editingId, formData)
        if (error) {
            alert("Error al guardar: " + (error as any).message)
        } else {
            resetForm()
        }
    }

    return (
        <div className="space-y-8 pb-20">
            <ProductsHeader stats={stats} />

            <ProductsActions 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showDeleted={showDeleted}
                setShowDeleted={setShowDeleted}
                onAddClick={() => { resetForm(); setIsEditing(true); }}
                categories={categories}
            />

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-32 flex flex-col items-center gap-6">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <p className="font-black uppercase tracking-[0.3em] italic text-sm opacity-50">Sincronizando menú...</p>
                    </motion.div>
                ) : displayedProducts.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Layers className="w-20 h-20 mx-auto text-white/5 mb-6" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sin resultados</h3>
                        <p className="text-muted-foreground mt-2">Prueba otra búsqueda o cambia el filtro.</p>
                    </motion.div>
                ) : viewMode === 'grid' ? (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.map((p, i) => (
                            <ProductCard 
                                key={p.id}
                                product={p}
                                index={i}
                                categoryName={categories.find(c => c.id === p.category_id)?.name}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onRestore={handleRestore}
                                onToggleAvailability={toggleAvailability}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <ProductsTable 
                        products={displayedProducts}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRestore={handleRestore}
                    />
                )}
            </AnimatePresence>

            {isEditing && (
                <ProductFormModal 
                    editingId={editingId}
                    formData={formData}
                    setFormData={setFormData}
                    onClose={resetForm}
                    onSave={onSave}
                    onFileUpload={handleFileUpload}
                    mediaLibrary={mediaLibrary}
                    loadingMedia={loadingMedia}
                    fetchMediaLibrary={fetchMediaLibrary}
                    uploading={uploading}
                    categories={categories}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}
