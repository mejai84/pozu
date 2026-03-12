import { Navbar } from "@/components/store/navbar"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden">
            <Navbar />

            {/* Luces Ambientales */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px] -z-10" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center container mx-auto px-6 text-center space-y-10 relative"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                    <div className="relative w-32 h-32 bg-green-500/10 border-2 border-green-500/20 rounded-[40px] flex items-center justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                        ¡Pedido <span className="text-green-500">Confirmado</span>!
                    </h1>
                    <p className="text-muted-foreground max-w-lg text-xl font-medium mx-auto leading-relaxed">
                        ¡Ruge ese motor! Hemos recibido tu pedido y nuestros chefs están dándolo todo en la parrilla.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <Link href="/">
                        <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 text-lg font-bold gap-3 hover:bg-white/5">
                            <Home className="w-5 h-5" /> Volver al Inicio
                        </Button>
                    </Link>
                    <Link href="/menu">
                        <Button className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter italic gap-3 shadow-xl shadow-primary/20">
                            <ShoppingCart className="w-5 h-5" /> Pedir algo más
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
