-- ==============================================
-- MIGRACIÓN MASIVA: Columnas faltantes Pozu 2.0
-- Fecha: 2026-04-10
-- ==============================================

-- 1. Tabla ORDERS: columnas que el frontend y n8n esperan
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}';
ALTER TABLE orders ALTER COLUMN items DROP NOT NULL;

-- 2. Tabla RESERVATIONS: columna que el formulario web necesita
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 3. Forzar recarga del esquema para PostgREST (n8n + Supabase client)
NOTIFY pgrst, 'reload schema';
