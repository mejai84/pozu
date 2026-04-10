-- Añadir columna de dirección para persistencia directa desde n8n
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;

-- Forzar recarga del esquema para PostgREST (n8n use)
NOTIFY pgrst, 'reload schema';
