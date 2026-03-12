import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usamos las variables de entorno disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const BUCKET = 'media'
const FOLDER = 'burgers'

const ALLOWED_IMAGES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const ALLOWED_VIDEOS = ['video/webm', 'video/mp4']

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData()
        const file = form.get('file') as File | null
        const type = form.get('type') as 'image' | 'video' | null

        if (!file || !type) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
        }

        // Validar tipo MIME
        const allowed = type === 'image' ? ALLOWED_IMAGES : ALLOWED_VIDEOS
        if (!allowed.includes(file.type)) {
            return NextResponse.json({ error: `Tipo no permitido: ${file.type}` }, { status: 400 })
        }

        // Crear nombre limpio y único
        const ext = file.name.split('.').pop()?.toLowerCase() || (type === 'image' ? 'png' : 'webm')
        const baseName = file.name
            .replace(/\.[^.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
        const fileName = `${baseName}.${ext}`
        const storagePath = `${FOLDER}/${fileName}`

        // Subir a Supabase Storage
        const supabase = createClient(supabaseUrl, supabaseKey)
        const buffer = Buffer.from(await file.arrayBuffer())

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: true, // sobreescribir si ya existe
            })

        if (uploadError) {
            console.error('Supabase upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // Obtener URL pública
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        const publicUrl = data.publicUrl

        return NextResponse.json({ url: publicUrl, name: fileName })

    } catch (error) {
        console.error('Upload route error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
