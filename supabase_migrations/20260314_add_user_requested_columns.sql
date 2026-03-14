-- Migración solicitada por el usuario el 14/03/2026

-- 1. Tabla products: Añadir alérgenos y stock
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allergens text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

-- 2. Tabla orders: Añadir teléfono, zona y llegada estimada
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_zone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_arrival timestamptz;

-- 3. Tabla order_items: Añadir notas por producto
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS notes text;
