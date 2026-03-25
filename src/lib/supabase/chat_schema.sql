
-- Tabla para mensajes de chat interactivo con n8n
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- 1. Permitir insertar a cualquiera (Usuario Web o n8n)
DROP POLICY IF EXISTS "Permitir inserción de mensajes" ON public.chat_messages;
CREATE POLICY "Permitir inserción de mensajes" ON public.chat_messages 
FOR INSERT WITH CHECK (true);

-- 2. Permitir leer a cualquiera (Para Realtime en el Frontend)
DROP POLICY IF EXISTS "Permitir lectura de mensajes" ON public.chat_messages;
CREATE POLICY "Permitir lectura de mensajes" ON public.chat_messages 
FOR SELECT USING (true);

-- Habilitar Realtime para esta tabla
ALTER publication supabase_realtime ADD TABLE chat_messages;
