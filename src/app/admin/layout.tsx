
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut, Users, Menu, ChefHat, BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ShoppingBag, label: "Pedidos", href: "/admin/orders" },
    { icon: ChefHat, label: "Cocina (KDS)", href: "/admin/kitchen" },
    { icon: UtensilsCrossed, label: "Productos", href: "/admin/products" },
    { icon: Users, label: "Clientes", href: "/admin/customers" },
    { icon: Users, label: "Empleados", href: "/admin/employees" },
    { icon: BarChart3, label: "Reportes", href: "/admin/reports" },
    { icon: Settings, label: "Configuración", href: "/admin/settings" },
]

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/admin/notification-bell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push("/login")
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (error || !data || (data.role !== 'admin' && data.role !== 'staff')) {
                router.push("/")
                return
            }

            setAuthorized(true)
            setLoading(false)
        }

        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-muted-foreground">Verificando acceso...</p>
                </div>
            </div>
        )
    }

    if (!authorized) return null

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black md:bg-card/50 flex flex-col transition-transform duration-300",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/logo.jpg"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            POZU ADMIN
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-12 text-base",
                                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push("/login")
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="h-16 border-b border-white/10 flex items-center px-6 md:hidden justify-between bg-card/50 sticky top-0 z-30 backdrop-blur-md">
                    <span className="font-bold">Pozu Admin</span>
                    <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
