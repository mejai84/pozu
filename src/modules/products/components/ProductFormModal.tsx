import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { X, Zap, Upload, VideoIcon, Loader2, AlertOctagon, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product, FormData, MediaMode, MediaItem } from "../types"

interface Props {
    editingId: string | null
    formData: FormData
    setFormData: (f: FormData) => void
    onClose: () => void
    onSave: () => void
    onFileUpload: (file: File, type: 'image' | 'video') => Promise<{ url?: string; error?: string }>
    mediaLibrary: MediaItem[]
    loadingMedia: boolean
    fetchMediaLibrary: () => void
    uploading: boolean
    categories: any[]
}

export const ProductFormModal = ({ 
    editingId, formData, setFormData, onClose, onSave, 
    onFileUpload, mediaLibrary, loadingMedia, fetchMediaLibrary, uploading, categories 
}: Props) => {
    const [imageMode, setImageMode] = useState<MediaMode>('url')
    const [videoMode, setVideoMode] = useState<MediaMode>('url')
    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File, type: 'image' | 'video') => {
        const { url } = await onFileUpload(file, type)
        if (url) {
            if (type === 'image') setFormData({ ...formData, image_url: url })
            else setFormData({ ...formData, video_url: url })
        }
    }

    return (
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
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
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
                                    <input ref={imageInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />
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
                                    <input ref={videoInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'video')} />
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
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-16 rounded-[1.2rem] font-black uppercase italic tracking-widest text-xs">Descartar</Button>
                    <Button onClick={onSave} className="flex-[2] h-16 rounded-[1.2rem] font-black uppercase italic tracking-widest text-lg bg-primary hover:bg-primary/80 text-black shadow-2xl shadow-primary/20">
                        {editingId ? 'Forjar Cambios' : 'Templar Producto'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
