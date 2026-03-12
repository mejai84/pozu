
"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, X, Loader2, Save, RotateCcw, Archive, Upload, Link2, ImageIcon, VideoIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { categories } from "@/lib/data"

type Product = {
    id: string
    name: string
    category_id: string
    price: number
    description: string | null
    image_url: string | null
    is_available: boolean
    ingredients: string[] | null
    deleted_at: string | null
    options?: any
}

type FormData = Partial<Product> & { video_url?: string }

// Modo de entrada de medios: 'url' o 'upload'
type MediaMode = 'url' | 'upload'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleted, setShowDeleted] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const [imageMode, setImageMode] = useState<MediaMode>('url')
    const [videoMode, setVideoMode] = useState<MediaMode>('url')

    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<FormData>({
        name: '',
        price: 0,
        category_id: 'cat_burgers',
        description: '',
        image_url: '',
        video_url: '',
        ingredients: []
    })

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

    const handleEdit = (product: any) => {
        setEditingId(product.id)
        setFormData({
            name: product.name,
            price: product.price,
            category_id: product.category_id,
            description: product.description,
            image_url: product.image_url,
            video_url: product.options?.video_url || '',
            ingredients: product.ingredients
        })
        setImageMode('url')
        setVideoMode('url')
        setIsEditing(true)
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ name: '', price: 0, category_id: 'cat_burgers', description: '', image_url: '', video_url: '', ingredients: [] })
        setImageMode('url')
        setVideoMode('url')
        setIsEditing(false)
    }

    // Upload a file to /public/images/burgers/ via API route
    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        setUploading(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('type', type)

            const res = await fetch('/api/upload', { method: 'POST', body: form })
            if (!res.ok) throw new Error('Upload failed')
            const { url } = await res.json()

            if (type === 'image') {
                setFormData(prev => ({ ...prev, image_url: url }))
            } else {
                setFormData(prev => ({ ...prev, video_url: url }))
            }
        } catch (err) {
            alert('Error al subir el archivo. Usa la URL manual.')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.price) return alert("Nombre y Precio son obligatorios")

        const productData = {
            name: formData.name,
            price: parseFloat(formData.price.toString()),
            category_id: formData.category_id,
            description: formData.description,
            image_url: formData.image_url,
            ingredients: Array.isArray(formData.ingredients) ? formData.ingredients : [],
            options: { video_url: formData.video_url || null }
        }

        let error;
        if (editingId) {
            const res = await supabase.from('products').update(productData).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('products').insert([productData])
            error = res.error
        }

        if (error) alert("Error al guardar: " + error.message)
        else { resetForm(); fetchProducts() }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Mover este producto a la papelera?")) return
        const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', id)
        if (error) {
            if (error.message.includes('deleted_at')) {
                if (confirm("¿Borrarlo permanentemente?")) await supabase.from('products').delete().eq('id', id)
            } else alert("Error al eliminar: " + error.message)
        }
        fetchProducts()
    }

    const handleRestore = async (id: string) => {
        const { error } = await supabase.from('products').update({ deleted_at: null }).eq('id', id)
        if (error) alert("Error al restaurar")
        else fetchProducts()
    }

    const displayedProducts = products.filter(p => showDeleted ? p.deleted_at : !p.deleted_at)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {showDeleted ? 'Papelera de Reciclaje' : 'Productos'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {showDeleted ? 'Recupera productos eliminados.' : 'Gestiona tu catálogo en tiempo real.'}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={showDeleted ? "outline" : "ghost"}
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`flex-1 sm:flex-none ${showDeleted ? "bg-red-500/10 text-red-500 border-red-500/20" : "text-muted-foreground"}`}
                    >
                        {showDeleted ? <Archive className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {showDeleted ? 'Ver Activos' : 'Papelera'}
                    </Button>
                    {!showDeleted && (
                        <Button className="flex-1 sm:flex-none gap-2" onClick={() => { resetForm(); setIsEditing(true); }}>
                            <Plus className="w-4 h-4" /> Nuevo Producto
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-card w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-white/10">
                            <h2 className="text-lg sm:text-xl font-bold">
                                {editingId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
                            
                            {/* Fila 1: Nombre + Precio */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Nombre del Producto*</label>
                                    <input
                                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary/50 outline-none transition-colors"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Hamburguesa Pozu"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Precio (€)*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary/50 outline-none transition-colors"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Categoría */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Categoría</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm [&>option]:text-black focus:border-primary/50 outline-none transition-colors"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* IMAGEN */}
                            <div className="space-y-2 p-4 bg-white/[0.03] rounded-2xl border border-white/8">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-blue-400" /> Imagen del Producto (PNG/JPG)
                                    </label>
                                    {/* Toggle URL / Upload */}
                                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                                        <button
                                            onClick={() => setImageMode('url')}
                                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${imageMode === 'url' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'}`}
                                        >
                                            <Link2 className="w-3 h-3" /> URL
                                        </button>
                                        <button
                                            onClick={() => setImageMode('upload')}
                                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${imageMode === 'upload' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'}`}
                                        >
                                            <Upload className="w-3 h-3" /> Subir
                                        </button>
                                    </div>
                                </div>

                                {imageMode === 'url' ? (
                                    <input
                                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-blue-400/50 outline-none transition-colors"
                                        value={formData.image_url || ''}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="/images/burgers/pozu.png"
                                    />
                                ) : (
                                    <div>
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                                        />
                                        <button
                                            onClick={() => imageInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-full h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-400/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-white transition-colors"
                                        >
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                            <span className="text-xs">{uploading ? 'Subiendo...' : 'Clic para seleccionar imagen'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Preview imagen */}
                                {formData.image_url && !formData.image_url.match(/\.(webm|mp4)$/i) && (
                                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                        <Image src={formData.image_url} alt="Preview" fill className="object-contain" />
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                                            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* VIDEO */}
                            <div className="space-y-2 p-4 bg-white/[0.03] rounded-2xl border border-primary/15">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <VideoIcon className="w-4 h-4 text-primary" /> Video (.webm) — Opcional
                                    </label>
                                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                                        <button
                                            onClick={() => setVideoMode('url')}
                                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${videoMode === 'url' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'}`}
                                        >
                                            <Link2 className="w-3 h-3" /> URL
                                        </button>
                                        <button
                                            onClick={() => setVideoMode('upload')}
                                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${videoMode === 'upload' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'}`}
                                        >
                                            <Upload className="w-3 h-3" /> Subir
                                        </button>
                                    </div>
                                </div>

                                {videoMode === 'url' ? (
                                    <input
                                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-primary/20 text-sm focus:border-primary/50 outline-none transition-colors"
                                        value={formData.video_url || ''}
                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                        placeholder="/images/burgers/pozu.webm"
                                    />
                                ) : (
                                    <div>
                                        <input
                                            ref={videoInputRef}
                                            type="file"
                                            accept="video/webm,video/mp4"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                                        />
                                        <button
                                            onClick={() => videoInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-full h-20 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <VideoIcon className="w-5 h-5" />}
                                            <span className="text-xs">{uploading ? 'Subiendo...' : 'Clic para seleccionar video .webm'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Preview video */}
                                {formData.video_url && (
                                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-primary/20 bg-black/20">
                                        <video src={formData.video_url} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, video_url: '' }))}
                                            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                )}

                                <p className="text-[10px] text-muted-foreground">Si hay video, se muestra como principal y la imagen aparece como miniatura en la esquina.</p>
                            </div>

                            {/* Ingredientes */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Ingredientes <span className="text-muted-foreground font-normal">(separados por coma)</span></label>
                                <textarea
                                    className="w-full h-16 p-3 rounded-lg bg-white/5 border border-white/10 resize-none text-sm focus:border-primary/50 outline-none transition-colors"
                                    value={Array.isArray(formData.ingredients) ? formData.ingredients.join(', ') : ''}
                                    onChange={e => setFormData({
                                        ...formData,
                                        ingredients: e.target.value.split(',').map(i => i.trim()).filter(i => i !== '')
                                    })}
                                    placeholder="Ej: Ternera, Queso Cheddar, Bacon, Salsa BBQ"
                                />
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Descripción <span className="text-muted-foreground font-normal">(texto de marketing)</span></label>
                                <textarea
                                    className="w-full h-16 p-3 rounded-lg bg-white/5 border border-white/10 resize-none text-sm focus:border-primary/50 outline-none transition-colors"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Una experiencia única con sabor ahumado..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-5 border-t border-white/10">
                            <Button variant="outline" onClick={resetForm} className="flex-1 border-white/10 hover:bg-white/5">
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="flex-1 font-bold gap-2">
                                <Save className="w-4 h-4" /> {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla/Cards de Productos */}
            <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="p-20 text-center text-muted-foreground">
                        {showDeleted ? "La papelera está vacía." : "No tienes productos activos."}
                    </div>
                ) : (
                    <>
                        {/* Vista Tabla (md+) */}
                        <table className="w-full text-left hidden md:table">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-muted-foreground">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Precio</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-white/5 relative overflow-hidden shrink-0">
                                                    <Image
                                                        src={product.image_url?.toLowerCase().endsWith('.webm')
                                                            ? product.image_url.replace(/\.webm$/i, '.png')
                                                            : (product.image_url || "/images/placeholder.png")}
                                                        alt={product.name}
                                                        fill
                                                        className={`object-cover ${product.deleted_at ? 'grayscale' : ''}`}
                                                    />
                                                </div>
                                                <div>
                                                    <span className={`font-medium ${product.deleted_at ? 'text-muted-foreground line-through' : ''}`}>
                                                        {product.name}
                                                    </span>
                                                    {product.options?.video_url && (
                                                        <div className="flex items-center gap-1 text-[10px] text-primary mt-0.5">
                                                            <VideoIcon className="w-3 h-3" /> Con video
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground capitalize">
                                            {categories.find(c => c.id === product.category_id)?.name || product.category_id}
                                        </td>
                                        <td className="p-4 font-mono">{product.price.toFixed(2)}€</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${
                                                product.deleted_at
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : product.is_available
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {product.deleted_at ? 'Eliminado' : product.is_available ? 'Activo' : 'Agotado'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {showDeleted ? (
                                                    <Button size="sm" variant="outline" className="gap-2 text-green-500 hover:text-green-400 border-green-500/20 hover:bg-green-500/10" onClick={() => handleRestore(product.id)}>
                                                        <RotateCcw className="w-3 h-3" /> Restaurar
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(product)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Vista Cards (móvil) */}
                        <div className="md:hidden divide-y divide-white/5">
                            {displayedProducts.map((product) => (
                                <div key={product.id} className="p-4 flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 relative overflow-hidden shrink-0 border border-white/5">
                                        <Image
                                            src={product.image_url?.toLowerCase().endsWith('.webm')
                                                ? product.image_url.replace(/\.webm$/i, '.png')
                                                : (product.image_url || "/images/placeholder.png")}
                                            alt={product.name}
                                            fill
                                            className={`object-cover ${product.deleted_at ? 'grayscale' : ''}`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold truncate ${product.deleted_at ? 'line-through text-muted-foreground' : ''}`}>
                                            {product.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-primary font-bold text-sm">{product.price.toFixed(2)}€</span>
                                            {product.options?.video_url && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-primary/70">
                                                    <VideoIcon className="w-3 h-3" /> video
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            product.deleted_at ? 'bg-red-500/10 text-red-500' : product.is_available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {product.deleted_at ? 'Eliminado' : product.is_available ? 'Activo' : 'Agotado'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {showDeleted ? (
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-500 border-green-500/20" onClick={() => handleRestore(product.id)}>
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(product)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
