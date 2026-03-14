"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, X, Loader2, Save, RotateCcw, Archive, Upload, Link2, ImageIcon, VideoIcon, Search, Filter, Layers, Zap, Info, AlertOctagon, Eye, LayoutGrid, List, Package } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { categories } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
    allergens: string | null // Campo nuevo
    stock_quantity: number | null // Campo nuevo
    options?: {
        video_url?: string | null
        badge?: string | null
        allergens?: string[] | null // Deprecated pero lo mantenemos por compatibilidad
    }
}

type FormData = Partial<Product> & { 
    video_url?: string;
    badge?: string;
}

type MediaMode = 'url' | 'upload' | 'library'
type ViewMode = 'grid' | 'table'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleted, setShowDeleted] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    
    const [mediaLibrary, setMediaLibrary] = useState<any[]>([])
    const [loadingMedia, setLoadingMedia] = useState(false)

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
        allergens: '',
        stock_quantity: 0
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

    const fetchMediaLibrary = async () => {
        setLoadingMedia(true)
        try {
            const { data, error } = await supabase.storage.from('media').list('burgers', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            })
            if (error) throw error
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
            
            setMediaLibrary((data || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
                name: f.name,
                url: `${supabaseUrl}/storage/v1/object/public/media/burgers/${f.name}`,
                type: f.metadata?.mimetype?.includes('video') ? 'video' : 'image'
            })))
        } catch (e: any) {
            console.error(e)
        }
        setLoadingMedia(false)
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
            allergens: product.allergens || '',
            stock_quantity: product.stock_quantity || 0
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
        setFormData({ name: '', price: 0, category_id: 'cat_burgers', description: '', image_url: '', video_url: '', badge: '', ingredients: [], allergens: '', stock_quantity: 0 })
        setImageMode('url')
        setVideoMode('url')
        setIsEditing(false)
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
            const url = result.url
            if (type === 'image') setFormData(prev => ({ ...prev, image_url: url }))
            else setFormData(prev => ({ ...prev, video_url: url }))
        } catch (err: any) {
            alert(`Error al subir el ${type}: ${err.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.price) return alert("Nombre y Precio son obligatorios")
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
        if (error) alert("Error al guardar: " + error.message)
        else { resetForm(); fetchProducts() }
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

    return (
        <div className="space-y-8 pb-20">
            {/* Header Pro con Stats */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> Inventario Maestro
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                            Catálogo <span className="text-primary">Pozu</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-lg text-lg">
                            Control total sobre tus productos, precios y multimedia. Sube videos y destaca lo mejor.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black italic text-primary">{stats.total}</div>
                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Activos</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black italic text-orange-500">{stats.outOfStock}</div>
                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Agotados</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hidden sm:block">
                            <div className="text-3xl font-black italic text-yellow-500">{stats.featured}</div>
                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Best Sellers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de Acciones */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 pl-14 outline-none focus:ring-2 focus:ring-primary/40 text-lg font-bold shadow-xl transition-all"
                        placeholder="Buscar sabor, nombre o detalle..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 p-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl overflow-x-auto no-scrollbar">
                    <select
                        className="bg-transparent px-4 py-2 font-black uppercase text-xs tracking-widest outline-none border-r border-white/10 cursor-pointer"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="all" className="bg-[#1A1A1A]">Todo</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1A1A1A]">{c.name}</option>)}
                    </select>

                    <div className="flex gap-1 border-r border-white/10 pr-2">
                        <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('table')} className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}><List className="w-4 h-4" /></button>
                    </div>

                    <button 
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`p-3 rounded-xl transition-all ${showDeleted ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                        title="Papelera"
                    >
                        <Archive className="w-4 h-4" />
                    </button>

                    <Button onClick={() => { resetForm(); setIsEditing(true); }} className="px-8 py-2 rounded-xl font-black uppercase italic tracking-tighter gap-2 bg-primary hover:bg-primary/80 transition-all text-black h-full">
                        <Plus className="w-5 h-5" /> Crear Pro
                    </Button>
                </div>
            </div>

            {/* Grid de Productos */}
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
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={p.id} 
                                className="group relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10"
                            >
                                {/* Media Container */}
                                <div className="aspect-square relative overflow-hidden bg-black/40 border-b border-white/5">
                                    {p.options?.video_url ? (
                                        <video src={p.options.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <Image src={p.image_url || "/images/placeholder.png"} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                                    )}
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {p.options?.badge && (
                                            <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest italic shadow-lg">
                                                {p.options.badge}
                                            </span>
                                        )}
                                        {p.options?.video_url && (
                                            <span className="px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                                <VideoIcon className="w-3 h-3" /> Motion
                                            </span>
                                        )}
                                        {/* Stock Badge */}
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1",
                                            (p.stock_quantity ?? 0) > 10 ? "bg-green-500/20 text-green-500 border border-green-500/20" : 
                                            (p.stock_quantity ?? 0) > 0 ? "bg-orange-500/20 text-orange-500 border border-orange-500/20" : 
                                            "bg-red-500 text-white"
                                        )}>
                                            <Package className="w-3 h-3" /> {p.stock_quantity ?? 0}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
                                        <button onClick={() => toggleAvailability(p)} className={`p-2 rounded-xl border ${p.is_available && (p.stock_quantity ?? 0) > 0 ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                                            <Zap className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-xl italic uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{categories.find(c => c.id === p.category_id)?.name}</p>
                                        </div>
                                        <div className="text-2xl font-black italic tracking-tighter text-white ml-2">{p.price.toFixed(2)}€</div>
                                    </div>
                                    
                                    {p.allergens && (
                                        <div className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-tighter bg-red-400/10 px-2 py-1 rounded-lg">
                                            <AlertOctagon className="w-3 h-3" /> {p.allergens}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                        {p.description || 'Sin descripción culinaria.'}
                                    </p>

                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <Button onClick={() => handleEdit(p)} variant="ghost" className="flex-1 bg-white/5 hover:bg-primary hover:text-black rounded-xl font-bold uppercase text-[10px] h-11 tracking-widest italic">
                                            <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                                        </Button>
                                        <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Vista Tabla Estilizada */
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                <tr>
                                    <th className="p-6">Producto</th>
                                    <th className="p-6">Categoría</th>
                                    <th className="p-6 text-center">Stock</th>
                                    <th className="p-6 text-center">Inversión</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-right">Manejo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayedProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-black relative overflow-hidden border border-white/10">
                                                    <Image src={p.image_url || "/images/placeholder.png"} alt={p.name} fill className="object-cover opacity-80" />
                                                </div>
                                                <div>
                                                    <span className="font-black text-lg italic uppercase tracking-tighter truncate max-w-[200px] block">{p.name}</span>
                                                    <div className="flex gap-2 items-center">
                                                        {p.options?.badge && <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">{p.options.badge}</span>}
                                                        {p.allergens && <span className="text-[9px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1"><AlertOctagon className="w-2.5 h-2.5" /> Alérgenos</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{categories.find(c => c.id === p.category_id)?.name}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={cn(
                                                "font-black text-lg",
                                                (p.stock_quantity ?? 0) <= 0 ? "text-red-500" : "text-white"
                                            )}>
                                                {p.stock_quantity ?? 0}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center font-black italic text-lg">{p.price.toFixed(2)}€</td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${p.is_available && (p.stock_quantity ?? 0) > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {p.is_available && (p.stock_quantity ?? 0) > 0 ? 'ACTIVO' : 'AGOTADO'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(p)} className="p-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Edición Pro */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20"><Zap className="w-6 h-6 text-primary" /></div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{editingId ? 'Refinar' : 'Forjar'} Producto</h2>
                            </div>
                            <button onClick={resetForm} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Identidad Visual</label>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setImageMode('url')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${imageMode === 'url' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>URL</button>
                                        <button onClick={() => setImageMode('upload')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${imageMode === 'upload' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>Subir</button>
                                        <button onClick={() => { setImageMode('library'); fetchMediaLibrary(); }} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${imageMode === 'library' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>Galería</button>
                                    </div>
                                    {imageMode === 'url' ? (
                                        <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold placeholder:opacity-30" placeholder="/images/burgers/pozu.png" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                                    ) : imageMode === 'upload' ? (
                                        <button onClick={() => imageInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-all group">
                                            <input ref={imageInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
                                            <Upload className="w-5 h-5 opacity-40 group-hover:text-primary group-hover:opacity-100" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{uploading ? 'Procesando...' : 'Elegir Imagen Local'}</span>
                                        </button>
                                    ) : (
                                        <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 h-[120px] overflow-y-auto custom-scrollbar grid grid-cols-4 gap-2">
                                            {loadingMedia ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary col-span-4 mt-6" /> : mediaLibrary.filter(m => !m.name.includes('.mp4') && !m.name.includes('.webm')).map(m => (
                                                <div key={m.name} onClick={() => setFormData({...formData, image_url: m.url})} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${formData.image_url === m.url ? 'border-primary shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-95' : 'border-transparent hover:border-white/20'}`} title={m.name}>
                                                    <Image src={m.url} alt={m.name} fill className="object-cover" />
                                                </div>
                                            ))}
                                            {!loadingMedia && mediaLibrary.length === 0 && <span className="col-span-4 text-center text-xs text-muted-foreground mt-6">Sin imágenes</span>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Cine (Video Opcional)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setVideoMode('url')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${videoMode === 'url' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>URL</button>
                                        <button onClick={() => setVideoMode('upload')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${videoMode === 'upload' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>Subir</button>
                                        <button onClick={() => { setVideoMode('library'); fetchMediaLibrary(); }} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${videoMode === 'library' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 transition-colors'}`}>Galería</button>
                                    </div>
                                    {videoMode === 'url' ? (
                                        <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold placeholder:opacity-30" placeholder="/video/burga.webm" value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                                    ) : videoMode === 'upload' ? (
                                        <button onClick={() => videoInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-all group">
                                            <input ref={videoInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} />
                                            <VideoIcon className="w-5 h-5 opacity-40 group-hover:text-primary group-hover:opacity-100" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{uploading ? 'Procesando...' : 'Elegir Video Local'}</span>
                                        </button>
                                    ) : (
                                        <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 h-[120px] overflow-y-auto custom-scrollbar grid grid-cols-4 gap-2">
                                            {loadingMedia ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary col-span-4 mt-6" /> : mediaLibrary.filter(m => m.name.includes('.mp4') || m.name.includes('.webm')).map(m => (
                                                <div key={m.name} onClick={() => setFormData({...formData, video_url: m.url})} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center bg-black ${formData.video_url === m.url ? 'border-primary shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-95' : 'border-transparent hover:border-white/20'}`} title={m.name}>
                                                    <VideoIcon className="w-6 h-6 opacity-40" />
                                                </div>
                                            ))}
                                            {!loadingMedia && mediaLibrary.filter(m => m.name.includes('.mp4') || m.name.includes('.webm')).length === 0 && <span className="col-span-4 text-center text-xs text-muted-foreground mt-6">Sin videos</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nombre Comercial</label>
                                    <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-lg font-black italic uppercase tracking-tighter" placeholder="BURGER POZU PRO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inversión (€)</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black italic text-primary" placeholder="12.00" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoría del Producto</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {categories.map(c => (
                                        <button 
                                            key={c.id} 
                                            onClick={() => setFormData({...formData, category_id: c.id})}
                                            className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.category_id === c.id ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                        <Package className="w-3 h-3 text-primary" /> Stock Disponible
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black italic text-white" 
                                        placeholder="Ej: 50" 
                                        value={formData.stock_quantity ?? 0} 
                                        onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} 
                                    />
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Si el stock llega a 0, la IA no lo venderá.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-red-500/60 tracking-widest flex items-center gap-2">
                                        <AlertOctagon className="w-3 h-3" /> Alérgenos Críticos
                                    </label>
                                    <textarea 
                                        className="w-full bg-black/40 border border-red-500/10 rounded-xl p-4 text-xs font-bold h-24 resize-none" 
                                        placeholder="Gluten, lácteos, sésamo..." 
                                        value={formData.allergens || ''} 
                                        onChange={e => setFormData({...formData, allergens: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Composición (Ingredientes)</label>
                                <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-bold h-20 resize-none" placeholder="Separados por coma..." value={formData.ingredients?.join(', ') || ''} onChange={e => setFormData({...formData, ingredients: e.target.value.split(',').map(v => v.trim())})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Relato Gastronómico (Descripción)</label>
                                <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium h-20 resize-none opacity-60 focus:opacity-100 transition-opacity" placeholder="Describe la experiencia de este producto..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-black/20 flex gap-4">
                            <Button variant="ghost" onClick={resetForm} className="flex-1 h-16 rounded-[1.2rem] font-black uppercase italic tracking-widest text-xs">Descartar</Button>
                            <Button onClick={handleSave} className="flex-[2] h-16 rounded-[1.2rem] font-black uppercase italic tracking-widest text-lg bg-primary hover:bg-primary/80 text-black shadow-2xl shadow-primary/20">
                                {editingId ? 'Forjar Cambios' : 'Templar Producto'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
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
