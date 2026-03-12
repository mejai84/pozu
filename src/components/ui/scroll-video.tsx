"use client"

import { useEffect, useRef, useState } from "react"
import { useScroll, useMotionValueEvent, useSpring } from "framer-motion"

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [frames, setFrames] = useState<string[]>([])
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [isReady, setIsReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  
  // Usamos un spring para suavizar el cambio de frames si el scroll es brusco
  const { scrollY } = useScroll()
  
  // 1. Cargar el manifest
  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch("/Frames/manifest.json")
        if (!res.ok) throw new Error("Manifest not found")
        const data = await res.json()
        setFrames(data)
      } catch (err) {
        console.error("Error cargando el manifest de frames:", err)
      }
    }
    loadManifest()
  }, [])

  // 2. Pre-cargar imágenes
  useEffect(() => {
    if (frames.length === 0) return

    let loadedCount = 0
    
    // Cargar el primero rápido
    const firstImg = new Image()
    firstImg.src = frames[0]
    firstImg.onload = () => {
        imagesRef.current[0] = firstImg
        setIsReady(true)
        drawFrame(0)
    }

    frames.forEach((src, index) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imagesRef.current[index] = img
        loadedCount++
        setLoadProgress(Math.floor((loadedCount / frames.length) * 100))
      }
      img.onerror = () => {
        loadedCount++
        setLoadProgress(Math.floor((loadedCount / frames.length) * 100))
      }
    });
  }, [frames])

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    
    // Intentar obtener el frame solicitado, o el más cercano anterior que esté cargado
    let img = imagesRef.current[index]
    if (!img) {
      for (let i = index; i >= 0; i--) {
        if (imagesRef.current[i]) {
          img = imagesRef.current[i]
          break
        }
      }
    }

    if (canvas && context && img && img.width > 0) {
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width
        canvas.height = img.height
      }
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      // LOGIC TO CENTER & AVOID PAN CUTOFF: 
      // 1. Recortamos arriba (16%) para pegar la imagen al header.
      // 2. NO RECORTAMOS la base (0%) para garantizar que TODA la hamburguesa aparezca.
      // 3. Recortamos laterales (6%) para un zoom centrado.
      const cropTop = img.height * 0.16
      const cropBottom = 0 
      const cropSides = img.width * 0.06
      
      const sourceX = cropSides
      const sourceY = cropTop
      const sourceWidth = img.width - (cropSides * 2)
      const sourceHeight = img.height - cropTop - cropBottom
      
      context.drawImage(
        img, 
        sourceX, sourceY, sourceWidth, sourceHeight, // Origen
        0, 0, canvas.width, canvas.height // Destino
      )
    }
  }

  // 3. Sincronización basada en PIXELES de scroll para ser ultra-sensible
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (frames.length === 0) return

    // Queremos que la animación dure unos 600px de scroll (muy rápida y reactiva)
    const scrollMax = 600
    const progress = Math.min(latest / scrollMax, 1)
    
    const index = Math.floor(progress * (frames.length - 1))
    drawFrame(index)
  })

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      {(!isReady || loadProgress < 10) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-20 rounded-[40px]">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <span className="text-primary font-black text-xs tracking-widest uppercase">{loadProgress}% Cargando</span>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className={`w-full max-w-full h-auto object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.95)] transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  )
}
