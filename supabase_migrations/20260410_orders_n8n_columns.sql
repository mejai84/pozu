-- ================================================================
-- 🔧 POZU 2.0 — Migración: Columnas faltantes en orders para n8n
-- Fecha: 2026-04-10
-- ================================================================
-- Añade columnas que el flujo n8n "Preparar para Supabase" envía
-- pero que no existían en la tabla orders.

DO $$
BEGIN
    -- customer_name: nombre del cliente extraído por la IA (redundante con guest_info->full_name)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_name TEXT;
    END IF;

    -- customer_phone: teléfono del cliente extraído por la IA (redundante con guest_info->phone)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
    END IF;

    -- items: campo JSONB para guardar el detalle del pedido y método de pago
    -- Estructura: { "detalle": "1 Hamburguesa Pozu (8€)", "metodo_pago": "Efectivo" }
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'items'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
    END IF;

    -- paid_at: timestamp de cuándo se pagó (usado por el webhook de Stripe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;

END $$;

-- Asegurar permisos para service_role (n8n usa esta key)
GRANT ALL ON public.orders TO service_role;

-- Comentario de contexto
COMMENT ON COLUMN public.orders.customer_name IS 'Nombre del cliente extraído por el AI Agent de n8n';
COMMENT ON COLUMN public.orders.customer_phone IS 'Teléfono del cliente extraído por el AI Agent de n8n';
COMMENT ON COLUMN public.orders.items IS 'Detalle del pedido en texto y método de pago: {detalle, metodo_pago}';
COMMENT ON COLUMN public.orders.paid_at IS 'Timestamp del pago confirmado por Stripe webhook';
