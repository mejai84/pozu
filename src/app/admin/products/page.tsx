
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
    options?: {
        video_url?: string | null
        badge?: string | null
        allergens?: string[] | null
    }
}

type FormData = Partial<Product> & { 
    video_url?: string;
    badge?: string;
    allergens?: string[];
}

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
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<FormData>({
        name: '',
        price: 0,
        category_id: 'cat_burgers',
        description: '',
        image_url: '',
        video_url: '',
        badge: '',
        ingredients: [],
        allergens: []
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
            allergens: product.options?.allergens || []
        })
        setImageMode('url')
        setVideoMode('url')
        setIsEditing(true)
    }

    const toggleAvailability = async (product: Product) => {
        const { error } = await supabase
            .from('products')
            .update({ is_available: !product.is_available })
            .eq('id', product.id)
        
        if (error) alert("Error al cambiar disponibilidad")
        else fetchProducts()
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ name: '', price: 0, category_id: 'cat_burgers', description: '', image_url: '', video_url: '', badge: '', ingredients: [], allergens: [] })
        setImageMode('url')
        setVideoMode('url')
        setIsEditing(false)
    }

    // Upload a file to /public/images/burgers/ via API route
    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        setUploading(true)
        console.log(`Iniciando subida de ${type}:`, file.name)
        
        try {
            const uploadFormData = new window.FormData()
            uploadFormData.append('file', file)
            uploadFormData.append('type', type)

            const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
            const result = await res.json()

            if (!res.ok) {
                console.error('Error en API de subida:', result.error)
                throw new Error(result.error || 'Upload failed')
            }

            const url = result.url
            console.log('Subida exitosa. URL:', url)

            if (type === 'image') {
                setFormData(prev => ({ ...prev, image_url: url }))
            } else {
                setFormData(prev => ({ ...prev, video_url: url }))
            }
        } catch (err: any) {
            console.error('Error completo en la subida:', err)
            alert(`Error al subir el ${type}: ${err.message}. Verifica las políticas de Storage.`)
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
            is_available: formData.is_available ?? true,
            ingredients: Array.isArray(formData.ingredients) ? formData.ingredients : [],
            options: { 
                video_url: formData.video_url || null,
                badge: formData.badge || null,
                allergens: Array.isArray(formData.allergens) ? formData.allergens : []
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

    const displayedProducts = products
        .filter(p => showDeleted ? p.deleted_at : !p.deleted_at)
        .filter(p => {
            const name = p.name || ''
            const desc = p.description || ''
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 desc.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter
            return matchesSearch && matchesCategory
        })

    return (
        <div className="space-y-6">
            {/* Header / Stats Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full hidden sm:block"></span>
                        {showDeleted ? 'Recuperación' : 'Catálogo Real'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {showDeleted ? 'Resucita lo que enviaste al olvido.' : 'Gestiona tus armas culinarias en tiempo real.'}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Buscador */}
                    <div className="relative flex-1 sm:min-w-[300px]">
                        <input 
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <Plus className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-45" />
                    </div>

                    {/* Filtro Categoría */}
                    <select
                        className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm [&>option]:text-black focus:border-primary/50 outline-none"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <Button
                        variant={showDeleted ? "outline" : "ghost"}
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`h-11 px-4 rounded-xl ${showDeleted ? "bg-red-500/10 text-red-500 border-red-500/20" : "text-muted-foreground"}`}
                    >
                        {showDeleted ? <Archive className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {showDeleted ? 'Activos' : 'Papelera'}
                    </Button>

                    {!showDeleted && (
                        <Button className="h-11 px-6 rounded-xl font-black uppercase text-xs tracking-wider gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" onClick={() => { resetForm(); setIsEditing(true); }}>
                            <Plus className="w-4 h-4" /> Nuevo Pro
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
                            
                            {/* Fila 1: Nombre + Precio + Etiqueta */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1 space-y-1.5">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Nombre del Producto*</label>
                                    <input
                                        className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-primary/50 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Hamburguesa Pozu"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Precio (€)*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-primary/50 outline-none transition-all font-mono"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Etiqueta (Badge)</label>
                                    <input
                                        className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-primary/50 outline-none transition-all"
                                        value={formData.badge || ''}
                                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                        placeholder="Ej: Best Seller"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Ingredientes */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider text-center block">Ingredientes</label>
                                    <textarea
                                        className="w-full h-24 p-4 rounded-xl bg-white/[0.03] border border-white/10 resize-none text-sm focus:border-primary/50 outline-none transition-all"
                                        value={Array.isArray(formData.ingredients) ? formData.ingredients.join(', ') : ''}
                                        onChange={e => setFormData({
                                            ...formData,
                                            ingredients: e.target.value.split(',').map(i => i.trim()).filter(i => i !== '')
                                        })}
                                        placeholder="Ternera, Queso, Bacon..."
                                    />
                                </div>

                                {/* Alérgenos */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider text-center block text-red-400">Alérgenos</label>
                                    <textarea
                                        className="w-full h-24 p-4 rounded-xl bg-white/[0.03] border border-white/10 resize-none text-sm focus:border-red-400/30 outline-none transition-all"
                                        value={Array.isArray(formData.allergens) ? formData.allergens.join(', ') : ''}
                                        onChange={e => setFormData({
                                            ...formData,
                                            allergens: e.target.value.split(',').map(i => i.trim()).filter(i => i !== '')
                                        })}
                                        placeholder="Gluten, Lácteos, Huevos..."
                                    />
                                </div>
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
                                    <th className="p-4">Producto / Escancia</th>
                                    <th className="p-4">Categoría / Rango</th>
                                    <th className="p-4">Inversión</th>
                                    <th className="p-4 text-center">Estado Vital</th>
                                    <th className="p-4 text-right">Manejo</th>
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
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold text-base ${product.deleted_at ? 'text-muted-foreground line-through' : 'text-white'}`}>
                                                            {product.name}
                                                        </span>
                                                        {product.options?.badge && (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-tighter">
                                                                {product.options.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {product.options?.video_url && (
                                                            <div className="flex items-center gap-1 text-[10px] text-primary/80 font-medium">
                                                                <VideoIcon className="w-3 h-3" /> Video
                                                            </div>
                                                        )}
                                                        {product.options?.allergens && product.options.allergens.length > 0 && (
                                                            <div className="flex items-center gap-1 text-[10px] text-red-400/80 font-medium">
                                                                <span className="w-1 h-1 rounded-full bg-red-400"></span>
                                                                {product.options.allergens.length} Alérgenos
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground capitalize">
                                            {categories.find(c => c.id === product.category_id)?.name || product.category_id}
                                        </td>
                                        <td className="p-4 font-mono">{product.price.toFixed(2)}€</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => !product.deleted_at && toggleAvailability(product)}
                                                className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    product.deleted_at
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : product.is_available
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:scale-105'
                                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 hover:scale-105'
                                                }`}
                                            >
                                                {product.deleted_at ? 'Eliminado' : product.is_available ? 'Activo' : 'Agotado'}
                                            </button>
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
                                        <button 
                                            onClick={() => !product.deleted_at && toggleAvailability(product)}
                                            className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                product.deleted_at 
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                                    : product.is_available 
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                            }`}
                                        >
                                            {product.deleted_at ? 'Eliminado' : product.is_available ? 'Activo' : 'Agotado'}
                                        </button>
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
