-- Migración: Módulo de Reparto Avanzado
-- Fecha: 2026-03-15

-- 1. Añadir signature_url a orders (para firma digital de entrega)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS signature_url text;

-- 2. El campo incidents ya es JSONB (verifica que existe)
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS incidents jsonb DEFAULT '[]'::jsonb;

-- 3. Crear bucket de Supabase Storage para evidencias de incidencias y firmas
-- Este paso se ejecuta desde el dashboard de Supabase Storage o via API:
-- Bucket name: 'incidents-photos'
-- Public: true (para URLs públicas directas)
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 4. Policy para que repartidores autenticados puedan subir fotos
-- (Ejecutar en Supabase SQL Editor o via Storage Policies)
-- INSERT INTO storage.policies (name, bucket_id, operation, definition)
-- La política se configura en el dashboard: authenticated users can INSERT

-- Verificar estructura actual del campo incidents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'incidents'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN incidents jsonb DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Columna incidents añadida';
    ELSE
        RAISE NOTICE 'Columna incidents ya existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'signature_url'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN signature_url text;
        RAISE NOTICE 'Columna signature_url añadida';
    ELSE
        RAISE NOTICE 'Columna signature_url ya existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivered_at timestamptz;
        RAISE NOTICE 'Columna delivered_at añadida';
    ELSE
        RAISE NOTICE 'Columna delivered_at ya existe';
    END IF;
END $$;
