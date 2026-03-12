"use client"

import { useEffect, useRef, useState } from "react"

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frames, setFrames] = useState<string[]>([])
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // 1. Cargar el manifest
  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch("/Frames/manifest.json")
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

    const loadImages = async () => {
      const images = await Promise.all(
        frames.map((src) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            img.src = src
            img.onload = () => resolve(img)
            img.onerror = () => resolve(img) // Evitar bloqueos si alguna falla
          })
        })
      )
      setLoadedImages(images)
    }

    loadImages()
  }, [frames])

  // 3. Manejar el scroll
  useEffect(() => {
    if (loadedImages.length === 0) return

    const handleScroll = () => {
      const scrollFraction = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      const index = Math.min(
        loadedImages.length - 1,
        Math.floor(scrollFraction * loadedImages.length)
      )
      
      if (index !== currentIndex) {
        setCurrentIndex(index)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadedImages, currentIndex])

  // 4. Dibujar en el canvas
  useEffect(() => {
    if (loadedImages.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const img = loadedImages[currentIndex]
    
    // Ajustar canvas al tamaño intrínseco de la imagen o al contenedor
    if (img.width > 0) {
      canvas.width = img.width
      canvas.height = img.height
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(img, 0, 0)
    }
  }, [loadedImages, currentIndex])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.85)]"
      />
    </div>
  )
}
