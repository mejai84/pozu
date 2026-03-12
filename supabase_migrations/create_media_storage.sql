-- ============================================================
-- POZU 2.0 - Supabase Storage: Bucket de Medios
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear bucket "media" (público para poder servir las URLs directamente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,         -- público: las URLs son accesibles sin autenticación
    52428800,     -- límite: 50 MB por archivo
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'video/webm',
        'video/mp4'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/gif','video/webm','video/mp4'];

-- 2. Política: Lectura pública (cualquiera puede ver los medios)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 3. Política: Subida autenticada (solo usuarios con sesión)
--    Si deseas permitir uploads desde el panel admin sin sesión, usa: true
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- 4. Política: Borrado autenticado
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

-- 5. Política: Actualización autenticada
CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');
