-- ================================================================
-- 🔧 POZU 2.0 — Migración: Gaps n8n v3.0 Dynamic (17 Marzo 2026)
-- ================================================================
-- Cubre: payment_link, payment_status en orders; allergens en products;
--        canal en error_logs; seed correcto de delivery_settings y feature_flags

-- 1. Tabla ORDERS — columnas requeridas por el flujo n8n v3.0
DO $$
BEGIN
    -- Link de pago Stripe (generado por n8n al elegir tarjeta)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_link'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_link TEXT;
    END IF;

    -- Estado del pago (pending → paid cuando Stripe confirma)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;

    -- Canal de origen del pedido (telegram, whatsapp, vapi, website_chat)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'source'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN source TEXT DEFAULT 'web';
    END IF;
END $$;

-- 2. Tabla PRODUCTS — campo allergens para la herramienta IA
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'allergens'
    ) THEN
        ALTER TABLE public.products ADD COLUMN allergens TEXT;
    END IF;
END $$;

-- 3. Tabla ERROR_LOGS — campo canal para filtrar por canal en el admin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'error_logs' AND column_name = 'canal'
    ) THEN
        ALTER TABLE public.error_logs ADD COLUMN canal TEXT DEFAULT 'desconocido';
    END IF;

    -- Alias del error para visualización rápida
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'error_logs' AND column_name = 'alert_message'
    ) THEN
        ALTER TABLE public.error_logs ADD COLUMN alert_message TEXT;
    END IF;
END $$;

-- 4. SETTINGS — Garantizar que delivery_settings tiene tax_percentage y taxes_enabled
-- Upsert completo con todos los campos que el flujo n8n necesita leer
INSERT INTO public.settings (key, value)
VALUES (
    'delivery_settings',
    '{
        "delivery_fee": 2.50,
        "min_order_amount": 10.00,
        "free_delivery_threshold": 25.00,
        "taxes_enabled": true,
        "tax_percentage": 10
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = settings.value || 
    '{
        "taxes_enabled": true,
        "tax_percentage": 10
    }'::jsonb
WHERE (settings.value->>'taxes_enabled') IS NULL 
   OR (settings.value->>'tax_percentage') IS NULL;

-- 5. SETTINGS — Garantizar que feature_flags tiene todos los flags del flujo n8n
INSERT INTO public.settings (key, value)
VALUES (
    'feature_flags',
    '{
        "online_payments_enabled": true,
        "cash_payments_enabled": true,
        "maintenance_mode": false,
        "reservations_enabled": true,
        "tracking_enabled": true,
        "delivery_enabled": true,
        "takeaway_enabled": true,
        "delivery_signature_enabled": true,
        "enable_combos": false
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = settings.value ||
    '{
        "online_payments_enabled": true,
        "cash_payments_enabled": true,
        "maintenance_mode": false
    }'::jsonb
WHERE (settings.value->>'online_payments_enabled') IS NULL;
