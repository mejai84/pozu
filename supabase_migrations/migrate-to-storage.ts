/**
 * migrate-to-storage.ts
 * 
 * Script de migración: sube las imágenes y videos locales a Supabase Storage
 * y actualiza los productos en la base de datos para que usen las URLs del Storage.
 * 
 * Ejecución: npx ts-node supabase_migrations/migrate-to-storage.ts
 */

const { createClient } = require('@supabase/supabase-js')
const { readFileSync, readdirSync } = require('fs')
const { join, extname, basename } = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BUCKET = 'media'
const FOLDER = 'burgers'
const LOCAL_DIR = join(process.cwd(), 'public', 'images', 'burgers')

const MIME_MAP: Record<string, string> = {
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.webm': 'video/webm',
    '.mp4':  'video/mp4',
}

async function uploadFile(localPath: string, fileName: string): Promise<string | null> {
    const ext = extname(fileName).toLowerCase()
    const contentType = MIME_MAP[ext]
    if (!contentType) {
        console.warn(`  ⚠ Tipo desconocido: ${fileName}, omitiendo.`)
        return null
    }

    const buffer = readFileSync(localPath)
    const storagePath = `${FOLDER}/${fileName}`

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType, upsert: true })

    if (error) {
        console.error(`  ✗ Error subiendo ${fileName}:`, error.message)
        return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
}

async function migrate() {
    console.log('\n🚀 MIGRACIÓN A SUPABASE STORAGE\n')
    console.log('Bucket:', BUCKET, '| Carpeta:', FOLDER)
    console.log('─'.repeat(50))

    // 1. Obtener todos los productos
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name, image_url, options')
    
    if (fetchError) {
        console.error('✗ Error leyendo productos:', fetchError.message)
        process.exit(1)
    }

    // 2. Listar archivos locales
    const files = readdirSync(LOCAL_DIR) as string[]
    console.log(`\n📁 Archivos locales en public/images/burgers/ (${files.length}):`)

    // 3. Subir cada archivo a Storage
    const urlMap: Record<string, string> = {} // filename.ext -> storage URL

    for (const file of files) {
        const localPath = join(LOCAL_DIR, file)
        const ext = extname(file).toLowerCase()
        if (!MIME_MAP[ext]) continue

        process.stdout.write(`  Subiendo ${file}... `)
        const url = await uploadFile(localPath, file)
        if (url) {
            urlMap[file] = url
            console.log('✓')
        }
    }

    console.log('\n📦 URLs generadas en Supabase Storage:')
    Object.entries(urlMap).forEach(([k, v]) => console.log(`  ${k} → ${v}`))

    // 4. Actualizar productos
    console.log('\n🔄 Actualizando productos en Supabase...\n')

    for (const product of products) {
        const productName = product.name.toLowerCase()
        
        // Buscar imagen (PNG) y video (WEBM) para este producto
        const imagePng = `${productName}.png`
        const imageJpg = `${productName}.jpg`
        const videoWebm = `${productName}.webm`

        const newImageUrl = urlMap[imagePng] || urlMap[imageJpg] || product.image_url
        const newVideoUrl = urlMap[videoWebm] || product.options?.video_url || null

        // Solo actualizar si cambió algo
        const imageChanged = newImageUrl && newImageUrl !== product.image_url
        const videoChanged = newVideoUrl !== product.options?.video_url

        if (!imageChanged && !videoChanged) {
            console.log(`  → ${product.name}: sin cambios`)
            continue
        }

        const updateData: any = {}
        if (imageChanged) updateData.image_url = newImageUrl
        if (imageChanged || videoChanged) {
            updateData.options = {
                ...(product.options || {}),
                video_url: newVideoUrl
            }
        }

        const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', product.id)

        if (updateError) {
            console.error(`  ✗ ${product.name}:`, updateError.message)
        } else {
            console.log(`  ✓ ${product.name}:`)
            if (imageChanged) console.log(`     imagen: ${newImageUrl}`)
            if (videoChanged) console.log(`     video:  ${newVideoUrl || 'eliminado'}`)
        }
    }

    console.log('\n✅ Migración completada.\n')
    console.log('⚠️  IMPORTANTE: Si algunos productos no se actualizaron, puede ser por')
    console.log('   políticas RLS. En ese caso:')
    console.log('   1. Ve a Supabase Dashboard > Table Editor > products')
    console.log('   2. Actualiza manualmente image_url con las URLs del Storage listadas arriba.')
    console.log()
}

migrate().catch(console.error)
