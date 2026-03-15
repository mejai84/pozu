"use client"

import { useRef, useEffect, useState } from "react"
import { Eraser, Download } from "lucide-react"

interface Props {
    onSignatureChange: (dataUrl: string | null) => void
    width?: number
    height?: number
}

export const SignatureCanvas = ({ onSignatureChange, width = 400, height = 180 }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.fillStyle = 'rgba(255,255,255,0.02)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#eab308'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }, [])

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            }
        }
        return {
            x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
            y: ((e as React.MouseEvent).clientY - rect.top) * scaleY
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const pos = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        isDrawing.current = true
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        e.preventDefault()
        const pos = getPos(e, canvas)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        if (!isDrawing.current) return
        isDrawing.current = false
        const canvas = canvasRef.current
        if (!canvas) return
        onSignatureChange(canvas.toDataURL('image/png'))
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255,255,255,0.02)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
        onSignatureChange(null)
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] touch-none cursor-crosshair hover:border-primary/30 transition-colors"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30">
                            Firmar aquí
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={clear}
                type="button"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-400 transition-colors"
            >
                <Eraser className="w-3.5 h-3.5" />
                Borrar firma
            </button>
        </div>
    )
}
