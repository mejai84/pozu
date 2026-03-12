import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData()
        const file = form.get('file') as File | null
        const type = form.get('type') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validar extensiones permitidas
        const allowedImages = ['image/png', 'image/jpeg', 'image/webp']
        const allowedVideos = ['video/webm', 'video/mp4']
        const allowed = type === 'image' ? allowedImages : allowedVideos

        if (!allowed.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
        }

        // Obtener extensión
        const ext = file.name.split('.').pop()?.toLowerCase() || (type === 'image' ? 'png' : 'webm')
        
        // Crear nombre limpio: sin espacios ni caracteres especiales
        const baseName = file.name
            .replace(/\.[^.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
        
        const fileName = `${baseName}.${ext}`
        const uploadDir = join(process.cwd(), 'public', 'images', 'burgers')

        // Asegurar que el directorio existe
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const filePath = join(uploadDir, fileName)
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        const publicUrl = `/images/burgers/${fileName}`
        return NextResponse.json({ url: publicUrl, name: fileName })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
    }
}
