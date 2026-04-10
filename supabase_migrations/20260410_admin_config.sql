-- Configurar módulo admin de Pozu 2.0
-- Ejecutar en Supabase SQL Editor

INSERT INTO settings (key, value)
VALUES (
  'admin_config',
  '{
    "pin": "1234",
    "description": "Cambia el pin por uno seguro. Mínimo 6 dígitos recomendados."
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Verificar que se insertó correctamente
SELECT key, value FROM settings WHERE key = 'admin_config';
