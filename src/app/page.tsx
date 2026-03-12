"use client"

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/store/navbar";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Preloader } from "@/components/ui/preloader";

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

      <main className="flex-1 relative z-10 flex flex-col justify-center container mx-auto px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 pb-16 sm:pb-20">
        
        {/* Hero Section */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-8 items-center mt-6 lg:mt-4">
          
          {/* Left Side: Headlines */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:gap-6 max-w-3xl relative z-30 order-2 lg:order-1"
          >
            <h1 
              className="text-[2.2rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[0.95] font-black uppercase tracking-tight text-[#E8E0D5] text-center lg:text-left drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
            >
              Las mejores<br className="hidden sm:block" />
              hamburguesas<br className="hidden sm:block" />
              urbanas,<br />
              pide ahora!
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center lg:justify-start mt-2 sm:mt-6"
            >
              <Link href="/menu">
                <button className="relative overflow-hidden font-black text-lg sm:text-2xl rounded-full neon-border text-primary px-8 sm:px-12 py-3 sm:py-5 hover:bg-primary hover:text-black hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] transition-all active:scale-95 group uppercase tracking-widest neon-text-glow">
                  <span className="relative z-10">Ver la Carta</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Burger Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full h-full flex justify-center items-center order-1 lg:order-2 lg:-mr-10 xl:-mr-20"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[800px] aspect-square lg:aspect-[4/3] mx-auto">
              <Image
                src="/images/burgers/pozu.png"
                alt="Hamburguesa Pozu"
                fill
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* 3 Interactive Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-12 lg:mt-6 z-20 relative max-w-5xl"
        >
          {/* Card 1 */}
          <div className="bg-[#1A1A1A] border-2 border-white/60 rounded-3xl p-4 flex gap-4 items-center shadow-2xl hover:border-white transition-colors group">
            <div className="flex-1 flex flex-col items-start gap-2 sm:gap-3">
              <h3 className="text-[#E8E0D5] font-black text-lg sm:text-xl uppercase leading-[1.1]">
                Burgers<br/>Legendarias
              </h3>
              <Link href="/menu?category=burgers">
                <button className="text-primary neon-border text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-primary hover:text-black transition-colors neon-text-glow">
                  Ver Menú
                </button>
              </Link>
            </div>
            <div className="w-20 h-20 sm:w-28 sm:h-24 relative rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/images/burgers/pozu.png" alt="Burgers" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1A1A1A] border-2 border-white/60 rounded-3xl p-4 flex gap-4 items-center shadow-2xl hover:border-white transition-colors group">
            <div className="flex-1 flex flex-col items-start gap-2 sm:gap-3">
              <h3 className="text-[#E8E0D5] font-black text-lg sm:text-xl uppercase leading-[1.1]">
                Sides &<br/>Snacks
              </h3>
              <Link href="/menu?category=sides">
                <button className="text-primary neon-border text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-primary hover:text-black transition-colors neon-text-glow">
                  Ver Menú
                </button>
              </Link>
            </div>
            <div className="w-20 h-20 sm:w-28 sm:h-24 relative rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800">
              <Image src="/images/burgers/pozu.png" alt="Sides" fill className="object-cover group-hover:scale-110 transition-transform duration-500 grayscale brightness-75" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1A1A1A] border-2 border-white/60 rounded-3xl p-4 flex gap-4 items-center shadow-2xl hover:border-white transition-colors group">
            <div className="flex-1 flex flex-col items-start gap-2 sm:gap-3">
              <h3 className="text-[#E8E0D5] font-black text-lg sm:text-xl uppercase leading-[1.1]">
                Combos<br/>Explosivos
              </h3>
              <Link href="/combos">
                <button className="text-primary neon-border text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-primary hover:text-black transition-colors neon-text-glow">
                  Ver Menú
                </button>
              </Link>
            </div>
            <div className="w-20 h-20 sm:w-28 sm:h-24 relative rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800">
              <Image src="/images/burgers/pozu.png" alt="Combos" fill className="object-cover group-hover:scale-110 transition-transform duration-500 sepia brightness-90" />
            </div>
          </div>
        </motion.div>

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
          <span className="text-xs font-bold text-[#E8E0D5]">Voice Assistant</span>
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <Mic className="w-4 h-4 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
}



