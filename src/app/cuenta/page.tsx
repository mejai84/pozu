
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Navbar } from "@/components/store/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
    User, 
    Settings, 
    LogOut, 
    ShoppingBag, 
    ShieldCheck, 
    Mail, 
    Phone,
    Calendar,
    ChevronRight,
    Loader2,
    Sparkles,
    Gift
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserProfile {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: string
    loyalty_points: number
}

export default function CuentaPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        full_name: "",
        phone: ""
    })
    const router = useRouter()

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push("/login")
                return
            }

            // Attempt to get profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            // If profile doesn't exist (trigger might have failed or not yet run), create it
            if (error && error.code === 'PGRST116') {
                const newProfile = {
                    id: session.user.id,
                    email: session.user.email || "",
                    full_name: session.user.user_metadata?.full_name || "Usuario Pozu",
                    phone: session.user.user_metadata?.phone || null,
                    role: 'customer',
                    loyalty_points: 0
                }
                const { data: inserted, error: insertError } = await supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single()
                
                if (!insertError) data = inserted
            }

            if (data) {
                setProfile(data)
                setEditData({
                    full_name: data.full_name || "",
                    phone: data.phone || ""
                })
            }
            setLoading(false)
        }

        getProfile()
    }, [router])

    const handleSaveProfile = async () => {
        if (!profile) return
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editData.full_name,
                    phone: editData.phone
                })
                .eq('id', profile.id)

            if (error) throw error

            setProfile(prev => prev ? { ...prev, ...editData } : null)
            setIsEditing(false)
            alert("Perfil actualizado con éxito")
        } catch (error: any) {
            alert("Error al actualizar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <Navbar />
            
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 opacity-50" />

            <div className="pt-28 sm:pt-40 container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(255,184,0,0.2)]">
                                <User className="w-12 h-12" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                                    Mi <span className="text-primary italic">Perfil</span>
                                </h1>
                                <p className="text-muted-foreground font-medium uppercase text-xs tracking-[0.2em]">
                                    Gestiona tu cuenta Pozu 2.0
                                </p>
                            </div>
                        </div>

                        {profile?.role === 'admin' || profile?.role === 'staff' ? (
                            <Link href="/admin">
                                <Button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black transition-all group font-bold italic uppercase tracking-tighter">
                                    <ShieldCheck className="w-5 h-5 mr-3 text-primary group-hover:text-black" />
                                    Panel de Administración
                                </Button>
                            </Link>
                        ) : null}
                    </div>

                    {/* Loylalty Points Card */}
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-2 border-primary/20 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />
                        
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-black uppercase text-primary tracking-widest">Fidelización</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                                    Tus Smash <span className="text-primary">Points</span>
                                </h2>
                                <p className="text-muted-foreground text-sm font-medium">Acumula puntos con cada pedido y canjéalos por brutalidad gratuita.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        {profile?.loyalty_points || 0}
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-[0.3em] text-primary mt-2">Puntos</div>
                                </div>
                                <div className="hidden md:flex w-24 h-24 rounded-full border-4 border-dashed border-primary/30 items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <Gift className="w-10 h-10 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar (Example max 100) */}
                        <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progreso Próximo Regalo</span>
                                <span className="text-sm font-black text-white">{profile?.loyalty_points || 0} / 100</span>
                            </div>
                            <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((profile?.loyalty_points || 0) / 100) * 100, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-yellow-600 to-primary relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Datos de Usuario
                                </h3>
                                {!isEditing && (
                                    <Button 
                                        onClick={() => setIsEditing(true)}
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                                    >
                                        Editar Perfil
                                    </Button>
                                )}
                            </div>
                            
                            <div className="space-y-6 relative z-10">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre Completo</label>
                                            <input 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-primary outline-none transition-all"
                                                value={editData.full_name}
                                                onChange={e => setEditData({...editData, full_name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Teléfono</label>
                                            <input 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-primary outline-none transition-all"
                                                value={editData.phone}
                                                onChange={e => setEditData({...editData, phone: e.target.value})}
                                                placeholder="+34 000 000 000"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                onClick={() => setIsEditing(false)}
                                                variant="ghost" 
                                                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button 
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-black"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nombre Completo</label>
                                            <p className="text-xl font-bold italic">{profile?.full_name || 'No proporcionado'}</p>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Correo Electrónico</label>
                                            <p className="text-xl font-bold opacity-60 italic">{profile?.email}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Teléfono</label>
                                            <p className="text-xl font-bold italic">{profile?.phone || 'No configurado'}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Rol del Sistema</label>
                                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {profile?.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Link href="/pedidos" className="group">
                                <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 hover:border-primary/40 transition-all flex items-center justify-between group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg uppercase tracking-tight">Mis Pedidos</h4>
                                            <p className="text-xs text-muted-foreground">Ver historial y estados</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/reservar" className="group">
                                <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 hover:border-primary/40 transition-all flex items-center justify-between group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg uppercase tracking-tight">Mis Reservas</h4>
                                            <p className="text-xs text-muted-foreground">Gestionar tus mesas</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Button 
                                onClick={handleSignOut}
                                variant="ghost" 
                                className="w-full h-20 rounded-[2rem] bg-red-500/5 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all gap-3 font-black uppercase tracking-widest italic"
                            >
                                <LogOut className="w-6 h-6" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
