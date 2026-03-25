
-- Tabla para logs de error centralizados desde n8n
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    node_name TEXT,
    error_message TEXT,
    alert_message TEXT,
    canal TEXT DEFAULT 'desconocido',
    workflow_id TEXT,
    item_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- 1. Permitir insertar a cualquiera (n8n no suele usar auth de Supabase directamente en inserts rápidos)
DROP POLICY IF EXISTS "Permitir inserción de logs" ON public.error_logs;
CREATE POLICY "Permitir inserción de logs" ON public.error_logs 
FOR INSERT WITH CHECK (true);

-- 2. Permitir leer solo a administradores (En un entorno real usaríamos roles, aquí simplificado para el dashboard)
DROP POLICY IF EXISTS "Permitir lectura de logs" ON public.error_logs;
CREATE POLICY "Permitir lectura de logs" ON public.error_logs 
FOR SELECT USING (true);
