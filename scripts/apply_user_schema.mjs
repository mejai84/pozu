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

async function applyUpdates() {
  console.log('🚀 Aplicando actualizaciones de esquema a Supabase...');
  
  const sql = `
    -- 1. Tabla products
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allergens text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

    -- 2. Tabla orders
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_zone text;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_arrival timestamptz;

    -- 3. Tabla order_items
    ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS notes text;
  `;

  // Intentamos ejecutar el SQL mediante la función RPC exec_sql
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    if (error.message && error.message.includes('function rpc.exec_sql() does not exist')) {
      console.warn('⚠️ La función RPC "exec_sql" no existe en tu instancia de Supabase.');
      console.warn('Por favor, ejecuta el siguiente SQL manualmente en el Dashboard de Supabase (SQL Editor):');
      console.log(sql);
    } else {
      console.error('❌ Error aplicando SQL:', error);
    }
  } else {
    console.log('✅ Esquema actualizado con éxito en Supabase.');
  }
}

applyUpdates();
