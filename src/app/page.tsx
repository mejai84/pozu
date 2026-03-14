"use client"

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/store/navbar";
import { motion } from "framer-motion";
import { Mic, Zap, Percent, Gift, MapPin, Clock, Phone } from "lucide-react";
import { Preloader } from "@/components/ui/preloader";
import { ScrollVideo } from "@/components/ui/scroll-video";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col relative overflow-hidden font-sans">
      <Preloader />
      {/* Texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(ellipse at top, #333333 0%, #0a0a0a 100%)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
        }}
      />

      {/* Top Navigation */}
      <div className="z-50 relative">
        <Navbar />
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center pt-0 pb-24 sm:pb-32 w-full overflow-x-hidden">
        
        {/* 1. HERO TEXT CONTENT - SITUADO AL INICIO PARA MÓVILES */}
        <section className="relative z-30 w-full pt-32 sm:pt-48 pb-12 sm:pb-20 px-6 text-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8 sm:space-y-12"
            >
              {/* Entradilla / Ubicación */}
              <div className="flex flex-col items-center gap-4">
                <span className="text-primary font-black italic uppercase tracking-[0.4em] text-[10px] sm:text-xs bg-primary/10 px-6 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
                  Pola de Laviana • Asturias
                </span>
                <div className="h-16 w-[2px] bg-gradient-to-b from-primary/0 via-primary to-primary/0" />
              </div>

              {/* Título Principal Brutal */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-[#E8E0D5] leading-[0.9] drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                  Sabor Brutal que <br />
                  <span className="text-primary italic neon-text-glow">Desafía la Gravedad</span>
                </h1>
                
                <h2 className="text-xl sm:text-4xl lg:text-5xl font-black italic text-white/90 tracking-tighter uppercase leading-none">
                  Pozu <span className="text-primary">2.0</span>
                </h2>
              </div>

              {/* Bajada persuasiva */}
              <div className="space-y-6 max-w-3xl mx-auto">
                <p className="text-base sm:text-2xl text-muted-foreground font-bold tracking-tight uppercase leading-tight">
                  La técnica Smash definitiva. <br />
                  <span className="text-white/40 font-black italic text-sm sm:text-lg">No es solo comida, es un vicio artesanal.</span>
                </p>
                <p className="text-[10px] sm:text-xs text-primary/60 font-black uppercase tracking-[0.3em]">
                   Técnica Smash impecable. Espíritu Rock. Vicio Artesanal.
                </p>
              </div>

              {/* Botón CTA Primario - Ahora más arriba para conversión rápida */}
              <div className="pt-8 sm:pt-12">
                <Link href="/menu">
                  <button className="relative overflow-hidden font-black text-xl sm:text-2xl rounded-full border-4 border-primary text-primary px-12 sm:px-24 py-4 sm:py-6 hover:bg-primary hover:text-black hover:shadow-[0_0_100px_rgba(234,179,8,0.7)] transition-all active:scale-95 group uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md">
                    <span className="relative z-10">¡HAZ TU PEDIDO!</span>
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                  </button>
                </Link>
              </div>
            </motion.div>
        </section>

        {/* 2. CINEMATIC HERO ANIMATION - BAJADA DE POSICIÓN */}
        <div className="flex flex-col items-center mt-0 sm:-mt-20 lg:-mt-32 relative w-full pt-0 bg-transparent mb-20 sm:mb-32">
          
          <div className="relative w-full flex justify-center items-center z-10 px-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full h-full flex items-center justify-center relative min-w-full"
            >
              <ScrollVideo />

              {/* Massive Glow behind the animation */}
              <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-[150px] -z-10 scale-110 opacity-30 animate-pulse" />
            </motion.div>
          </div>

          {/* Social Proof metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-8 flex flex-wrap justify-center gap-10 text-[#E8E0D5]/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] z-20"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary text-xl">★ ★ ★ ★ ★</span>
              <span>4.9 Valoración</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary text-xl">⚡</span>
              <span>+10k Servidas</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary text-xl">♥</span>
              <span>Asturias Real</span>
            </div>
          </motion.div>
        </div>

        {/* --- SPACER FOR FLOW --- */}
        <div className="h-24 sm:h-32 lg:h-48" />

        {/* 3 Interactive Cards - Unified Design & Professional Spanish Copy */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 mb-20 z-20 relative max-w-7xl mx-auto w-full"
        >
          {/* Card 1: Burgers */}
          <Link href="/menu?category=0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e" className="group">
            <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-between text-center shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center z-10 mb-6">
                <h3 className="text-[#E8E0D5] font-black text-2xl sm:text-3xl uppercase mb-3 group-hover:text-primary transition-colors tracking-tighter leading-[1.1]">
                  Hamburguesas<br />Legendarias
                </h3>
                <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-relaxed max-w-[200px] mb-6 hidden sm:block">
                  Auténtica técnica smash: costra extracrujiente e interior jugoso.
                </p>
                <div className="text-primary border-2 border-primary/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full group-hover:bg-primary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all bg-black/50">
                  VER LA CARTA
                </div>
              </div>
              <div className="w-full relative h-40 sm:h-48 flex-shrink-0 z-10 transition-transform duration-700 group-hover:scale-110">
                <Image
                  src="/images/burgers/pozu.png"
                  alt="Hamburguesas Artesanales"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </Link>

          {/* Card 2: Sides */}
          <Link href="/menu?category=bae3f11e-df43-44b7-82ed-7c2a77098c82" className="group">
            <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-between text-center shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center z-10 mb-6">
                <h3 className="text-[#E8E0D5] font-black text-2xl sm:text-3xl uppercase mb-3 group-hover:text-primary transition-colors tracking-tighter leading-[1.1]">
                  Entrantes<br />Canallas
                </h3>
                <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-relaxed max-w-[200px] mb-6 hidden sm:block">
                  Patatas trufadas y picoteo brutal para abrir el apetito.
                </p>
                <div className="text-primary border-2 border-primary/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full group-hover:bg-primary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all bg-black/50">
                  PICOTEO DEL BUENO
                </div>
              </div>
              <div className="w-full relative h-40 sm:h-48 flex-shrink-0 z-10 transition-transform duration-700 group-hover:-rotate-3">
                <Image
                  src="/images/burgers/pozu.png"
                  alt="Entrantes"
                  fill
                  className="object-contain grayscale-[0.2] brightness-90 group-hover:grayscale-0 group-hover:brightness-100 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] scale-[0.9] group-hover:scale-100 transition-all duration-700"
                />
              </div>
            </div>
          </Link>

          {/* Card 3: Combos */}
          <Link href="/combos" className="group">
            <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-between text-center shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center z-10 mb-6">
                <h3 className="text-[#E8E0D5] font-black text-2xl sm:text-3xl uppercase mb-3 group-hover:text-primary transition-colors tracking-tighter leading-[1.1]">
                  Combos<br />Para Arrasar
                </h3>
                <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-relaxed max-w-[200px] mb-6 hidden sm:block">
                  Combina tus favoritos y sal rodando al mejor precio.
                </p>
                <div className="text-primary border-2 border-primary/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full group-hover:bg-primary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all bg-black/50">
                  VER COMBOS
                </div>
              </div>
              <div className="w-full relative h-40 sm:h-48 flex-shrink-0 z-10 transition-transform duration-700 group-hover:rotate-3">
                <Image
                  src="/images/burgers/pozu.png"
                  alt="Combos"
                  fill
                  className="object-contain sepia-[0.3] brightness-90 group-hover:sepia-0 group-hover:brightness-100 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-all duration-700"
                />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* --- SECCIÓN CHOLLOS (PROMOS) --- */}
        <section id="promos" className="py-12 sm:py-24 relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6 mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#E8E0D5] neon-text-glow">
                Chollos <span className="text-primary italic">Insuperables</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                ¿Mucha hambre y poco presupuesto? Aquí tienes nuestras combinaciones ganadoras para que nadie se quede con las ganas.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Promo 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1A1A1A] border-2 border-white/10 rounded-[3rem] p-8 flex flex-col items-center text-center shadow-2xl hover:border-primary transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Banquete Para Dos</h3>
                <p className="text-muted-foreground mb-6 flex-1 text-sm">
                  Cita perfecta: 2 Smash Burgers de Doble Carne + 1 Ración de Patatas Trufadas + 2 Bebidas para bajarlo.
                </p>
                <div className="text-3xl font-black text-primary mb-6 neon-text-glow">24,90€</div>
                <Link href="/menu" className="w-full">
                  <button className="text-primary w-full neon-border text-xs font-bold uppercase tracking-wider px-6 py-4 rounded-full hover:bg-primary hover:text-black transition-all neon-text-glow">
                    Pedir Banquete
                  </button>
                </Link>
              </motion.div>

              {/* Promo 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#1A1A1A] border-2 border-primary neon-border rounded-[3rem] p-10 flex flex-col items-center text-center shadow-[0_0_30px_rgba(234,179,8,0.15)] relative"
              >
                <div className="absolute -top-4 bg-primary text-black font-black uppercase text-[10px] px-6 py-2 rounded-full tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                  Más Vendido
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Percent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Smash Wednesday</h3>
                <p className="text-muted-foreground mb-6 flex-1 text-sm">
                  Cortamos la semana por la mitad: Todos los miércoles, tu segunda smash a mitad de precio. Sin letra pequeña.
                </p>
                <div className="text-3xl font-black text-primary mb-6 neon-text-glow">-50% OFF</div>
                <Link href="/menu" className="w-full">
                  <button className="bg-primary text-black w-full neon-border text-xs font-black uppercase tracking-wider px-6 py-4 rounded-full hover:bg-transparent hover:text-primary transition-all neon-text-glow">
                    ¡Lo Quiero!
                  </button>
                </Link>
              </motion.div>

              {/* Promo 3 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1A1A1A] border-2 border-white/10 rounded-[3rem] p-8 flex flex-col items-center text-center shadow-2xl hover:border-primary transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-black text-2xl uppercase text-[#E8E0D5] mb-2">Caos Total</h3>
                <p className="text-muted-foreground mb-6 flex-1 text-sm">
                  Para cuando traes a la tropa: 4 Smash Burgers + Montaña de Patatas + 4 Bebidas + 2 Postres Caseros para el remate.
                </p>
                <div className="text-3xl font-black text-primary mb-6 neon-text-glow">49,50€</div>
                <Link href="/menu" className="w-full">
                  <button className="text-primary w-full neon-border text-xs font-bold uppercase tracking-wider px-6 py-4 rounded-full hover:bg-primary hover:text-black transition-all neon-text-glow">
                    Desatar Caos
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN UBICACIÓN (POZU CERCA) --- */}
        <section id="ubicacion" className="py-24 relative overflow-hidden bg-white/[0.02]">
          <div className="container mx-auto px-6 max-w-7xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#E8E0D5] neon-text-glow">
                Tu Templo <span className="text-primary italic">Smash</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                No confíes en nuestro copy. Ven, mancha tus manos de salsa y compruébalo tú mismo en Pola de Laviana.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 text-left">
              {/* Info Card */}
              <div className="lg:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#1A1A1A] border-2 border-white/5 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2 tracking-tighter">Localización</h3>
                  <p className="text-muted-foreground text-sm uppercase font-bold tracking-tight">C. Río Cares, 2<br />33980 Pola de Laviana<br />Asturias, España</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#1A1A1A] border-2 border-white/5 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2 tracking-tighter">Horarios</h3>
                  <p className="text-muted-foreground text-sm uppercase font-bold tracking-tight">Martes a Domingo:<br />19:30 - 23:30<br /><br />Lunes: Cerrado por descanso</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-[#1A1A1A] border-2 border-white/5 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-black text-xl uppercase text-[#E8E0D5] mb-2 tracking-tighter">Contacto</h3>
                  <p className="text-muted-foreground text-sm uppercase font-bold tracking-tight">Teléfono: +34 987 654 321<br />Email: hola@pozu.com<br />O escríbenos a WhatsApp</p>
                </motion.div>
              </div>

              {/* Google Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-2 h-[400px] lg:h-full w-full rounded-[3rem] overflow-hidden border-2 border-white/5 hover:border-primary transition-all relative group shadow-2xl order-first lg:order-last"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2909.103098523674!2d-5.5645!3d43.2458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd367b660a0a0a0a%3A0x0!2sC.%20R%C3%ADo%20Cares%2C%202%2C%2033980%20Pola%20de%20Laviana%2C%20Asturias!5e0!3m2!1ses!2ses!4v1642150000000!5m2!1ses!2ses"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', mixBlendMode: 'screen' }}
                  allowFullScreen
                  loading="lazy"
                  className="grayscale-[0.8] transition-all duration-700 hover:grayscale-0 hover:mix-blend-normal opacity-60 hover:opacity-100"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 sm:bottom-24 right-4 sm:right-6 flex flex-col gap-3 sm:gap-4 z-50 items-end">
        <a
          href="https://wa.me/34600000000"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/20"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
        <button className="hidden sm:flex items-center gap-3 bg-[linear-gradient(180deg,#3b3b3b,#1f1f1f)] border border-white/20 px-5 py-2.5 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
          <span className="text-xs font-bold text-[#E8E0D5]">¡Pide por Voz!</span>
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <Mic className="w-4 h-4 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
}



