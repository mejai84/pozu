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

async function fixUpdateRLS() {
  console.log('🚀 Aplicando parches de RLS para permitir ACTUALIZAR pedidos...');
  
  const sql = `
    -- Permitir UPDATE público en la tabla orders
    DROP POLICY IF EXISTS "Enable update for everyone" ON public.orders;
    CREATE POLICY "Enable update for everyone" 
    ON public.orders FOR UPDATE 
    USING (true)
    WITH CHECK (true);

    -- Permitir UPDATE público en order_items (si fuera necesario)
    DROP POLICY IF EXISTS "Enable update items for everyone" ON public.order_items;
    CREATE POLICY "Enable update items for everyone" 
    ON public.order_items FOR UPDATE 
    USING (true)
    WITH CHECK (true);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.warn('⚠️ No se pudo ejecutar vía RPC.');
    console.log('Copia y pega este SQL en el Editor SQL de Supabase:\n');
    console.log(sql);
  } else {
    console.log('✅ Políticas de UPDATE actualizadas con éxito.');
  }
}

fixUpdateRLS();
