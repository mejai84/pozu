-- ================================================================
-- 🔧 POZU 2.0 — Migración: Fix para order_type y order_items
-- Fecha: 2026-04-10
-- ================================================================

DO $$
BEGIN
    -- 1. Añadir order_type a orders si no existe (Fallo del POS Dashboard)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'order_type'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'dine_in'));
    END IF;

    -- 2. Crear tabla order_items si no existe (Fallo 404 en n8n)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'order_items'
    ) THEN
        CREATE TABLE public.order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES public.products(id),
            combo_id UUID, -- Dejar sin FK estricto al vuelo por si cambia
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            customizations JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            error_log JSONB -- Por si hay errores de matcheo en IA
        );
    END IF;
END $$;

-- 3. Asegurar permisos indispensables para la REST API y la Service Role de n8n
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;

-- 4. VACÍO DE CACHÉ DE SUPABASE (CRÍTICO PARA ARREGLAR EL ERROR 404 Y "NOT FOUND IN SCHEMA CACHE")
NOTIFY pgrst, 'reload schema';
