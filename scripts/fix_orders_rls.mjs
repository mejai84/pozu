import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  console.log('🚀 Aplicando parches de RLS para permitir pedidos invitados...');
  
  const sql = `
    -- 1. Asegurar que RLS esté activo
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

    -- 2. Eliminar políticas conflictivas si existen
    DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
    DROP POLICY IF EXISTS "Enable insert items for everyone" ON public.order_items;
    DROP POLICY IF EXISTS "Enable select for everyone" ON public.orders;
    DROP POLICY IF EXISTS "Enable select items for everyone" ON public.order_items;

    -- 3. Permitir INSERT público (anónimo) en orders
    CREATE POLICY "Enable insert for everyone" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

    -- 4. Permitir INSERT público en order_items
    CREATE POLICY "Enable insert items for everyone" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

    -- 5. Permitir SELECT público para que el cliente vea su confirmación
    CREATE POLICY "Enable select for everyone" 
    ON public.orders FOR SELECT 
    USING (true);

    -- 6. Permitir SELECT público en order_items
    CREATE POLICY "Enable select items for everyone" 
    ON public.order_items FOR SELECT 
    USING (true);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.warn('⚠️ No se pudo ejecutar vía RPC.');
    console.log('Copia y pega este SQL en el Editor SQL de Supabase:\n');
    console.log(sql);
  } else {
    console.log('✅ Políticas RLS actualizadas con éxito.');
  }
}

fixRLS();
