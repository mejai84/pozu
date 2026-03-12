-- ============================================================
-- POZU 2.0 - Supabase Storage: Bucket de Medios
-- 
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/project/vvlowhdimjjmsrpovurw
-- 2. En el menú lateral: Storage > Buckets > New Bucket
--    - Name: media
--    - Public bucket: ✅ activado
--    - File size limit: 50 MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp, video/webm, video/mp4
-- 3. Una vez creado el bucket, ejecuta SOLO las políticas de abajo en SQL Editor
-- ============================================================

-- ⚠ NO crear el bucket por SQL (falla RLS con anon key).
-- Crearlo MANUALMENTE desde el Dashboard como se indica arriba.

-- ============================================================
-- POLÍTICAS DE ACCESO (ejecutar en SQL Editor DESPUÉS de crear el bucket)
-- ============================================================

-- Borrar políticas anteriores si existen
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from media" ON storage.objects;

-- 1. Lectura pública (cualquiera puede ver/descargar archivos del bucket media)
CREATE POLICY "Allow public read from media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 2. Upload público sin autenticación requerida
--    (permite que la API route de Next.js suba archivos con la anon key)
CREATE POLICY "Allow public upload to media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- 3. Actualizar archivos existentes (upsert)
CREATE POLICY "Allow public update in media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 4. Borrar archivos
CREATE POLICY "Allow public delete from media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');
